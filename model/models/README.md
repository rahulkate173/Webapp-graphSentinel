# Models Directory

Place your trained EdgeGAT model checkpoint (`.pth` file) here.

## Expected Format

The checkpoint should be a **state dict only** saved via:
```python
torch.save(model.state_dict(), "model_LI-Small.pth")
```

## Architecture Requirements

The model must match the EdgeGAT architecture from the training notebook:
- **Node feature dim:** 4 (out-degree, in-degree, sum_sent, sum_received)
- **Edge feature dim:** 5 (amount_log, hour, day_of_week, payment_enc, currency_enc)
- **Hidden dim:** 64
- **Num layers:** 2
- **Num heads:** 4
- **Num classes:** 2

## Auto-Detection

The server automatically loads the **latest** `.pth` file (by modification time).
To use a specific file, set the `MODEL_FILENAME` environment variable.

## Size Guidelines

| Size | Deployment |
|------|-----------|
| < 100 MB | Commit to repo, deploy on Render |
| ≥ 100 MB | Use Google Drive + `scripts/download_model.py` |
