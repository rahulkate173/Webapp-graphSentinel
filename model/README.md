# 🛡️ GraphSentinel — AML Detection API

Anti-Money Laundering detection API powered by **EdgeGAT** (Graph Attention Network for edge classification). Analyzes transaction networks to identify suspicious accounts and fraud rings.

## Architecture

```
CSV Upload → Preprocess → Build Graph → EdgeGAT Inference → Fraud Ring Detection → JSON Report
```

The model classifies each **transaction (edge)** as laundering or normal, then aggregates results into account-level suspicion scores and detects connected fraud rings via BFS.

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Place your trained model

Copy your `.pth` file into the `models/` directory:

```bash
cp model_LI-Small.pth models/
```

### 3. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### `GET /health`

```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "model_LI-Small.pth",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### `POST /predict`

**Request:**
```json
{
  "csv_url": "https://res.cloudinary.com/.../transactions.csv"
}
```

**Response:**
```json
{
  "suspicious_accounts": [
    {
      "account_id": "11_8000ECA90",
      "suspicion_score": 87.5,
      "detected_patterns": ["high_velocity", "network_cluster", "high_risk_score"],
      "ring_id": "RING_001",
      "transactions": [
        {
          "transaction_id": "T1",
          "sender_id": "11_8000ECA90",
          "receiver_id": "1120_8006AA910",
          "amount": 592571.0,
          "timestamp": "2022-09-01 00:00:00"
        }
      ]
    }
  ],
  "fraud_rings": [
    {
      "ring_id": "RING_001",
      "member_accounts": ["11_8000ECA90", "1120_8006AA910"],
      "pattern_type": "network_cluster",
      "risk_score": 95.3
    }
  ],
  "summary": {
    "total_accounts_analyzed": 500,
    "suspicious_accounts_flagged": 15,
    "fraud_rings_detected": 4,
    "processing_time_seconds": 2.3
  }
}
```

### CSV Format

The CSV must contain these columns:

| Column | Description |
|--------|-------------|
| `Timestamp` | Transaction timestamp |
| `From Bank` | Sender bank ID |
| `Account` | Sender account number |
| `To Bank` | Receiver bank ID |
| `Account.1` | Receiver account number |
| `Amount Received` | Amount received |
| `Receiving Currency` | Currency received |
| `Amount Paid` | Amount paid |
| `Payment Currency` | Payment currency |
| `Payment Format` | Format (Cheque, Wire, etc.) |
| `Is Laundering` | Label (optional for inference) |

## Deployment

### Render (< 100MB model)

1. Push to GitHub with model in `models/`
2. Connect repo on Render
3. Uses `render.yaml` blueprint

### Docker

```bash
docker build -t graphsentinel .
docker run -p 8000:8000 graphsentinel
```

With Google Drive model:
```bash
docker build --build-arg GDRIVE_MODEL_ID=<your_file_id> -t graphsentinel .
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_DIR` | `models` | Model directory path |
| `MODEL_FILENAME` | (auto-detect) | Specific model file |
| `SUSPICION_THRESHOLD` | `0.5` | Edge probability threshold |
| `MAX_CSV_SIZE_MB` | `50` | Max CSV download size |
| `PORT` | `8000` | Server port |

## Model Training

See `notebooks/trail-2-money-muling.ipynb` for the full training pipeline using the IBM AML dataset.
