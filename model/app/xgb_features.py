"""
xgb_features.py - shared feature engineering for the GraphSentinel XGBoost AML model.

The SAME file is used by the Kaggle training notebook and by the FastAPI
inference service, so training and serving can never drift apart.

Input  : a transactions DataFrame with the IBM AML columns
         Timestamp, From Bank, Account, To Bank, Account.1,
         Amount Received, Receiving Currency, Amount Paid,
         Payment Currency, Payment Format
         (+ optional accounts DataFrame: Bank ID, Account Number, Entity ID)
Output : float32 DataFrame, one row per transaction (original row order),
         columns == FEATURE_COLUMNS.  NaN means "not applicable" and is
         handled natively by XGBoost.

Everything is vectorised numpy (no python loops over rows) so it scales to the
~32M row HI-Medium dataset.
"""

import numpy as np
import pandas as pd

# --------------------------------------------------------------------------
# Fixed vocabularies (IBM AML dataset) -> stable codes between train & serve
# --------------------------------------------------------------------------
PAYMENT_FORMATS = ["Reinvestment", "Cheque", "Credit Card", "ACH", "Cash", "Wire", "Bitcoin"]
CURRENCIES = [
    "US Dollar", "Euro", "Yuan", "Shekel", "Rupee", "UK Pound", "Yen", "Ruble",
    "Canadian Dollar", "Australian Dollar", "Swiss Franc", "Brazil Real",
    "Mexican Peso", "Saudi Riyal", "Bitcoin",
]

REQUIRED_TRANS_COLUMNS = [
    "Timestamp", "From Bank", "Account", "To Bank", "Account.1",
    "Amount Received", "Receiving Currency", "Amount Paid",
    "Payment Currency", "Payment Format",
]

_NODE_STATS = [
    "out_cnt", "in_cnt", "out_uniq", "in_uniq",
    "out_sum_log", "in_sum_log",
    "out_mean_log", "out_std_log", "in_mean_log", "in_std_log",
    "flow_ratio",
]

FEATURE_COLUMNS = (
    # ---- edge level ----
    ["amt_paid_log", "amt_recv_log", "amt_log_diff", "cross_currency",
     "pay_fmt", "pay_cur", "recv_cur", "hour", "dow",
     "same_bank", "self_loop", "pair_cnt", "rev_cnt"]
    # ---- sender / receiver node statistics ----
    + [f"s_{k}" for k in _NODE_STATS]
    + [f"r_{k}" for k in _NODE_STATS]
    # ---- amount relative to the accounts' own behaviour ----
    + ["amt_vs_s_out_mean", "amt_vs_r_in_mean"]
    # ---- entity (accounts.csv) ----
    + ["same_entity", "s_ent_accts", "r_ent_accts"]
    # ---- temporal / pass-through behaviour ----
    + ["s_gap_prev_out", "s_gap_next_out", "r_gap_prev_in",
       "s_prev_in_delay", "s_prev_in_amt_ratio",
       "r_next_out_delay", "r_next_out_amt_ratio",
       # ---- burst behaviour (same day / same hour windows) ----
       "s_day_out_cnt", "s_day_out_uniq", "r_day_in_cnt", "r_day_in_uniq",
       "s_day_in_cnt", "r_day_out_cnt", "s_hr_out_cnt", "r_hr_in_cnt"]
)

_GOLD = np.uint64(0x9E3779B97F4A7C15)


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------
class _Feat(dict):
    """dict that stores every feature as float32 the moment it is assigned (halves peak RAM)."""

    def __setitem__(self, key, value):
        super().__setitem__(key, np.asarray(value, dtype=np.float32))


def account_keys(bank, acct) -> np.ndarray:
    """uint64 key per (bank, account-number) without building giant strings."""
    acct_arr = pd.Series(acct).astype(str).to_numpy(dtype=object)
    h = pd.util.hash_array(acct_arr)
    bank_u = np.asarray(pd.to_numeric(pd.Series(bank), errors="coerce").fillna(-1), dtype=np.int64).astype(np.uint64)
    with np.errstate(over="ignore"):
        return h + bank_u * _GOLD


def _cat_codes(series: pd.Series, categories) -> np.ndarray:
    """Map a (possibly categorical) string column onto a fixed vocabulary; -1 = unknown."""
    if not isinstance(series.dtype, pd.CategoricalDtype):
        series = series.astype("category")
    lut = {c: i for i, c in enumerate(categories)}
    cat_lut = np.array([lut.get(c, -1) for c in series.cat.categories], dtype=np.int16)
    codes = series.cat.codes.to_numpy()
    out = np.full(len(codes), -1, dtype=np.int16)
    ok = codes >= 0
    out[ok] = cat_lut[codes[ok]]
    return out.astype(np.float32)


def _lookup(sorted_keys: np.ndarray, vals: np.ndarray, query: np.ndarray) -> np.ndarray:
    """vals[key == query] from a sorted unique key table; 0 when absent."""
    if len(sorted_keys) == 0:
        return np.zeros(len(query), dtype=np.float64)
    idx = np.searchsorted(sorted_keys, query)
    idxc = np.minimum(idx, len(sorted_keys) - 1)
    ok = sorted_keys[idxc] == query
    return np.where(ok, vals[idxc], 0).astype(np.float64)


def _gaps(group: np.ndarray, t: np.ndarray, big: int):
    """Minutes to the previous / next STRICTLY earlier / later event of the same group.

    Strict comparison makes the result independent of the row order (ties at the same
    minute no longer depend on which row happens to come first).
    """
    key = group * big + t
    sk = np.sort(key)
    n = len(sk)
    ip = np.searchsorted(sk, key, side="left") - 1
    ipc = np.clip(ip, 0, n - 1)
    okp = (ip >= 0) & (sk[ipc] // big == group)
    prev = np.where(okp, key - sk[ipc], np.nan)
    inx = np.searchsorted(sk, key, side="right")
    inxc = np.minimum(inx, n - 1)
    okn = (inx < n) & (sk[inxc] // big == group)
    nxt = np.where(okn, sk[inxc] - key, np.nan)
    return prev, nxt


def _count_table(keys: np.ndarray):
    uk, inv, cnt = np.unique(keys, return_inverse=True, return_counts=True)
    return uk, cnt, cnt[inv.ravel()].astype(np.float64)


def _uniq_table(group_keys: np.ndarray, member: np.ndarray, member_range: int):
    """number of distinct `member` values inside every group key -> (sorted keys, counts)."""
    triple = np.unique(group_keys * member_range + member)
    uk, cnt = np.unique(triple // member_range, return_counts=True)
    return uk, cnt


# --------------------------------------------------------------------------
# main entry point
# --------------------------------------------------------------------------
def build_features(df: pd.DataFrame, accounts_df: pd.DataFrame = None, as_numpy: bool = False):
    """Return a float32 DataFrame (default) or, with as_numpy=True, an (n, len(FEATURE_COLUMNS)) ndarray."""
    n = len(df)
    ts = pd.to_datetime(df["Timestamp"])
    t = (((ts - ts.min()).dt.total_seconds()) // 60).to_numpy(dtype=np.int64)   # minutes
    hour = ts.dt.hour.to_numpy()
    dow = ts.dt.dayofweek.to_numpy()

    paid = df["Amount Paid"].astype("float64").fillna(0).to_numpy()
    recv = df["Amount Received"].astype("float64").fillna(0).to_numpy()
    lp = np.log1p(paid)
    lr = np.log1p(recv)

    # ---------------- node ids ----------------
    ks = account_keys(df["From Bank"], df["Account"])
    kr = account_keys(df["To Bank"], df["Account.1"])
    codes, node_keys = pd.factorize(np.concatenate([ks, kr]))
    s = codes[:n].astype(np.int64)
    r = codes[n:].astype(np.int64)
    del codes, ks, kr
    N = len(node_keys)

    # ---------------- node statistics ----------------
    out_cnt = np.bincount(s, minlength=N).astype(np.float64)
    in_cnt = np.bincount(r, minlength=N).astype(np.float64)
    out_sum = np.bincount(s, weights=paid, minlength=N)
    in_sum = np.bincount(r, weights=recv, minlength=N)
    oc = np.maximum(out_cnt, 1)
    ic = np.maximum(in_cnt, 1)
    out_mean = np.bincount(s, weights=lp, minlength=N) / oc
    in_mean = np.bincount(r, weights=lr, minlength=N) / ic
    out_sq = np.bincount(s, weights=lp * lp, minlength=N) / oc
    in_sq = np.bincount(r, weights=lr * lr, minlength=N) / ic
    out_std = np.sqrt(np.maximum(out_sq - out_mean ** 2, 0))
    in_std = np.sqrt(np.maximum(in_sq - in_mean ** 2, 0))

    pair_key = s * N + r
    upk, inv, pc = np.unique(pair_key, return_inverse=True, return_counts=True)
    pair_cnt = pc[inv.ravel()].astype(np.float64)
    out_uniq = np.bincount(upk // N, minlength=N).astype(np.float64)
    in_uniq = np.bincount(upk % N, minlength=N).astype(np.float64)
    rev_cnt = _lookup(upk, pc, r * N + s)
    del pair_key, inv

    node_stats = {
        "out_cnt": out_cnt, "in_cnt": in_cnt, "out_uniq": out_uniq, "in_uniq": in_uniq,
        "out_sum_log": np.log1p(out_sum), "in_sum_log": np.log1p(in_sum),
        "out_mean_log": out_mean, "out_std_log": out_std,
        "in_mean_log": in_mean, "in_std_log": in_std,
        "flow_ratio": np.log1p(in_sum) - np.log1p(out_sum),
    }

    base = {
        "amt_paid_log": lp,
        "amt_recv_log": lr,
        "amt_log_diff": lr - lp,
        "pay_fmt": _cat_codes(df["Payment Format"], PAYMENT_FORMATS),
        "pay_cur": _cat_codes(df["Payment Currency"], CURRENCIES),
        "recv_cur": _cat_codes(df["Receiving Currency"], CURRENCIES),
        "hour": hour,
        "dow": dow,
        "same_bank": (df["From Bank"].to_numpy() == df["To Bank"].to_numpy()).astype(np.float32),
        "self_loop": (s == r).astype(np.float32),
        "pair_cnt": pair_cnt,
        "rev_cnt": rev_cnt,
    }
    feat = _Feat()
    for _k, _v in base.items():
        feat[_k] = _v
    del base
    # cross-currency compared on the fixed vocabulary codes (works for category & object dtypes)
    feat["cross_currency"] = (feat["pay_cur"] != feat["recv_cur"]).astype(np.float32)

    for prefix, idx in (("s", s), ("r", r)):
        for k, arr in node_stats.items():
            feat[f"{prefix}_{k}"] = arr[idx]
    feat["amt_vs_s_out_mean"] = lp - feat["s_out_mean_log"]
    feat["amt_vs_r_in_mean"] = lr - feat["r_in_mean_log"]

    # ---------------- entity features (optional accounts.csv) ----------------
    nan_arr = np.full(n, np.nan)
    feat["same_entity"], feat["s_ent_accts"], feat["r_ent_accts"] = nan_arr, nan_arr.copy(), nan_arr.copy()
    if accounts_df is not None and len(accounts_df):
        try:
            ka = account_keys(accounts_df["Bank ID"], accounts_df["Account Number"])
            ent_codes, _ = pd.factorize(accounts_df["Entity ID"].astype(str))
            ent_n = np.bincount(ent_codes).astype(np.float64)
            order = np.argsort(ka)
            ka_sorted = ka[order]
            pos = np.minimum(np.searchsorted(ka_sorted, node_keys), len(ka_sorted) - 1)
            valid = ka_sorted[pos] == node_keys
            node_ent = np.where(valid, ent_codes[order[pos]], -1)
            node_ent_n = np.where(valid, ent_n[np.maximum(node_ent, 0)], np.nan)
            se, re_ = node_ent[s], node_ent[r]
            feat["same_entity"] = np.where((se >= 0) & (re_ >= 0), (se == re_).astype(np.float64), np.nan)
            feat["s_ent_accts"] = node_ent_n[s]
            feat["r_ent_accts"] = node_ent_n[r]
        except KeyError:
            pass   # accounts file without the expected columns -> leave NaN

    # ---------------- temporal / pass-through ----------------
    BIG = int(t.max()) + 2
    s_prev, s_next = _gaps(s, t, BIG)
    r_prev, _ = _gaps(r, t, BIG)
    feat["s_gap_prev_out"], feat["s_gap_next_out"], feat["r_gap_prev_in"] = s_prev, s_next, r_prev
    # event tables sorted by (node, minute, amount) -> deterministic even with ties
    out_order = np.lexsort((lp, t, s))
    in_order = np.lexsort((lr, t, r))

    out_node, out_t, out_lp = s[out_order], t[out_order], lp[out_order]
    out_keys = out_node * BIG + out_t
    in_node, in_t, in_lr = r[in_order], t[in_order], lr[in_order]
    in_keys = in_node * BIG + in_t

    # when did the SENDER last receive money (strictly before this transfer)?
    idx = np.searchsorted(in_keys, s * BIG + t, side="left") - 1
    idxc = np.clip(idx, 0, n - 1)
    ok = (idx >= 0) & (in_node[idxc] == s)
    feat["s_prev_in_delay"] = np.where(ok, t - in_t[idxc], np.nan)
    feat["s_prev_in_amt_ratio"] = np.where(ok, lp - in_lr[idxc], np.nan)

    # when does the RECEIVER next forward money?
    idx = np.searchsorted(out_keys, r * BIG + t, side="left")
    idxc = np.minimum(idx, n - 1)
    ok = (idx < n) & (out_node[idxc] == r)
    feat["r_next_out_delay"] = np.where(ok, out_t[idxc] - t, np.nan)
    feat["r_next_out_amt_ratio"] = np.where(ok, out_lp[idxc] - lr, np.nan)

    # ---------------- burst windows ----------------
    day = t // 1440
    ND = int(day.max()) + 2
    out_day_key = s * ND + day
    in_day_key = r * ND + day
    uk_o, c_o, feat["s_day_out_cnt"] = _count_table(out_day_key)
    uk_i, c_i, feat["r_day_in_cnt"] = _count_table(in_day_key)
    feat["s_day_in_cnt"] = _lookup(uk_i, c_i, s * ND + day)
    feat["r_day_out_cnt"] = _lookup(uk_o, c_o, r * ND + day)
    uk, cnt = _uniq_table(out_day_key, r, N)
    feat["s_day_out_uniq"] = _lookup(uk, cnt, out_day_key)
    uk, cnt = _uniq_table(in_day_key, s, N)
    feat["r_day_in_uniq"] = _lookup(uk, cnt, in_day_key)

    hr = t // 60
    NH = int(hr.max()) + 2
    _, _, feat["s_hr_out_cnt"] = _count_table(s * NH + hr)
    _, _, feat["r_hr_in_cnt"] = _count_table(r * NH + hr)

    missing = set(FEATURE_COLUMNS) - set(feat)
    extra = set(feat) - set(FEATURE_COLUMNS)
    assert not missing and not extra, f"feature mismatch: missing={missing} extra={extra}"
    if as_numpy:
        X = np.empty((n, len(FEATURE_COLUMNS)), dtype=np.float32)
        for j, c in enumerate(FEATURE_COLUMNS):
            X[:, j] = feat.pop(c)          # free each column as soon as it is copied
        return X
    return pd.DataFrame({c: feat[c] for c in FEATURE_COLUMNS})
