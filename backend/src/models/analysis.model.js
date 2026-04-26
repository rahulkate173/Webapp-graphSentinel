import mongoose from "mongoose";

// ── Embedded: single transaction ──────────────────────────────────────────────
const transactionSchema = new mongoose.Schema(
  {
    transaction_id: String,
    sender_id: String,
    receiver_id: String,
    amount: Number,
    timestamp: String,
  },
  { _id: false }
);

// ── Embedded: suspicious account ──────────────────────────────────────────────
const suspiciousAccountSchema = new mongoose.Schema(
  {
    account_id: String,
    suspicion_score: Number,
    detected_patterns: [String],
    ring_id: String,
    transactions: [transactionSchema],
  },
  { _id: false }
);

// ── Embedded: fraud ring ───────────────────────────────────────────────────────
const fraudRingSchema = new mongoose.Schema(
  {
    ring_id: String,
    flow_analysis: {
      origin_node: String,
      exit_node: String,
      total_hop_count: Number,
    },
    accounts: [
      {
        account_id: String,
        role: String,
        suspicion_score: Number,
        detected_patterns: [String],
      }
    ],
    transactions: [transactionSchema],
    context: {
      time_window: String,
      analysis_type: String,
      pattern_identified: String,
    }
  },
  { _id: false }
);

// ── Embedded: summary ─────────────────────────────────────────────────────────
const summarySchema = new mongoose.Schema(
  {
    total_accounts_analyzed: Number,
    suspicious_accounts_flagged: Number,
    fraud_rings_detected: Number,
    processing_time_seconds: Number,
  },
  { _id: false }
);

// ── Root document ─────────────────────────────────────────────────────────────
const analysisResultSchema = new mongoose.Schema(
  {
    // Which bank / organization submitted these files
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    // First CSV (transactions)
    transactions_cloudinary_url: {
      type: String,
      required: true,
    },

    // Second CSV (accounts)
    accounts_cloudinary_url: {
      type: String,
      required: true,
    },

    suspicious_accounts: [suspiciousAccountSchema],
    fraud_rings: [fraudRingSchema],
    summary: summarySchema,

    analyzed_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AnalysisResult = mongoose.model("AnalysisResult", analysisResultSchema);
export default AnalysisResult;
