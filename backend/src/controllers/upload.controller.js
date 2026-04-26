import cloudinary from "../services/files.service.js";
import AnalysisResult from "../models/analysis.model.js";
import { getIO } from "../config/socket.js";
import { sendEmail } from "../services/mail.service.js";
import { generateFraudAlertEmail } from "../utils/emailTemplate.js";

// ── Helper: upload a single buffer to Cloudinary as raw CSV (stream-based) ────
// Stream upload avoids base64 inflation (~33% size overhead) that causes 499 timeouts.
function uploadToCloudinary(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "csv_uploads",
        format: "csv",
        public_id: `${Date.now()}_${originalname.replace(/[^a-zA-Z0-9_.-]/g, "_")}`,
        timeout: 120000, // 2-minute timeout per file
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer); // pipe the in-memory buffer directly into the stream
  });
}

// ── Helper: call real ML microservice ─────────────────────────────────────────
async function callMLAPI(transactionsUrl, accountsUrl) {
  const response = await fetch("https://webapp-graphsentinel.onrender.com/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactions_csv_url: transactionsUrl,
      accounts_csv_url: accountsUrl,
    }),
  });
console.log(response)
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ML API error ${response.status}: ${text}`);
  }

  return response.json();
}

// ── POST /api/files/upload-csv ─────────────────────────────────────────────────
// Flow: auth → multer (2 files) → Cloudinary → ML API → MongoDB → response
async function uploadController(req, res) {
  try {
    // ── 1. Validate files ──────────────────────────────────────────────────────
    const files = req.files;

    if (!files || files.length !== 2) {
      return res.status(400).json({
        error: "Exactly 2 CSV files are required (transactions + accounts).",
      });
    }

    // Validate both are CSV
    const CSV_MIME = ["text/csv", "application/vnd.ms-excel", "application/csv"];
    for (const f of files) {
      const isCsvName = f.originalname.toLowerCase().endsWith(".csv");
      const isCsvMime = CSV_MIME.includes(f.mimetype);
      if (!isCsvName && !isCsvMime) {
        return res.status(400).json({
          error: `File "${f.originalname}" is not a CSV file. Only .csv files are accepted.`,
        });
      }
    }

    // Optional: warn on filename conventions (not hard block)
    const [txFile, acFile] = files;
    console.log(`[Upload] transactions file: ${txFile.originalname}`);
    console.log(`[Upload] accounts file:     ${acFile.originalname}`);

    // ── 2. Upload BOTH to Cloudinary (order preserved) ────────────────────────
    console.log("[Cloudinary] Uploading transactions CSV…");
    const transactionsUrl = await uploadToCloudinary(txFile.buffer, txFile.originalname);
    console.log("[Cloudinary] transactions URL:", transactionsUrl);

    console.log("[Cloudinary] Uploading accounts CSV…");
    const accountsUrl = await uploadToCloudinary(acFile.buffer, acFile.originalname);
    console.log("[Cloudinary] accounts URL:", accountsUrl);

    // ── 3. Call real ML API ────────────────────────────────────────────────────
    console.log("[ML API] Sending URLs to https://webapp-graphsentinel.onrender.com …");
    const mlResult = await callMLAPI(transactionsUrl, accountsUrl);
    console.log("[ML API] Response received:");
    console.log(JSON.stringify(mlResult, null, 2));

    // ── 4. Persist to MongoDB ─────────────────────────────────────────────────
    const record = await AnalysisResult.create({
      organization: req.user._id,
      transactions_cloudinary_url: transactionsUrl,
      accounts_cloudinary_url: accountsUrl,
      suspicious_accounts: mlResult.suspicious_accounts ?? [],
      fraud_rings: mlResult.fraud_rings ?? [],
      summary: mlResult.summary ?? {},
    });
    // ── Check and send Fraud Alert Email ──────────────────────────────────────
    try {
      const highRiskRings = (mlResult.fraud_rings || []).filter(r => r.risk_score > 50);
      if (highRiskRings.length > 0 && req.user.email) {
        const emailHtml = generateFraudAlertEmail(
          highRiskRings, 
          mlResult.suspicious_accounts, 
          req.user.organization_name
        );
        if (emailHtml) {
          await sendEmail(
            req.user.email,
            "🚨 Suspicious Activity Alert - GraphSentinal",
            "High-risk transaction rings detected. Please check the dashboard.",
            emailHtml
          );
        }
      }
    } catch (emailErr) {
      console.error("[EmailAlertError]", emailErr);
    }

    // ── 5. Return full response ───────────────────────────────────────────────
    return res.status(201).json({
      message: "CSV files uploaded and analysed successfully.",
      record_id: record._id,
      organization: {
        id: req.user._id,
        name: req.user.organization_name,
      },
      cloudinary_urls: {
        transactions: transactionsUrl,
        accounts: accountsUrl,
      },
      ml_response: mlResult,
    });
  } catch (error) {
    console.error("[uploadController]", error);
    return res.status(500).json({
      error: "Upload and analysis failed.",
      details: error.message,
    });
  }
}

// ── POST /api/files/external-upload-csv ───────────────────────────────────────
// API-key authenticated route (called by Postman / external clients).
// Responds immediately with 202 + jobId so the caller knows the job started.
// Drives the full pipeline async and emits live Socket.IO events to the bank room.
async function externalUploadController(req, res) {
  // bankId is the organisation's MongoDB _id (the authenticated user's _id)
  const bankId = String(req.user._id);
  const jobId  = `job_${Date.now()}`;

  const files = req.files;

  // ── Quick validation before accepting ─────────────────────────────────────
  if (!files || files.length !== 2) {
    return res.status(400).json({
      error: "Exactly 2 CSV files are required (transactions + accounts).",
    });
  }

  const CSV_MIME = ["text/csv", "application/vnd.ms-excel", "application/csv"];
  for (const f of files) {
    const isCsvName = f.originalname.toLowerCase().endsWith(".csv");
    const isCsvMime = CSV_MIME.includes(f.mimetype);
    if (!isCsvName && !isCsvMime) {
      return res.status(400).json({
        error: `File "${f.originalname}" is not a CSV file. Only .csv files are accepted.`,
      });
    }
  }

  // ── Acknowledge immediately (client should not wait for ML) ───────────────
  res.status(202).json({ jobId, bankId, message: "Job accepted. Track status via WebSocket." });

  // ── Async pipeline (runs after response is sent) ───────────────────────────
  const io = getIO();
  const [txFile, acFile] = files;

  try {
    // 1. Uploading files to Cloudinary
    await io.logRoomSize(bankId);  // ← diagnostic: shows subscriber count
    io.to(bankId).emit("job_update", { jobId, status: "UPLOADING_FILES" });
    console.log(`[ExternalUpload] [${jobId}] Uploading CSVs to Cloudinary…`);

    const transactionsUrl = await uploadToCloudinary(txFile.buffer, txFile.originalname);
    const accountsUrl     = await uploadToCloudinary(acFile.buffer, acFile.originalname);
    console.log(`[ExternalUpload] [${jobId}] Cloudinary upload done.`);

    // 2. Running ML model
    io.to(bankId).emit("job_update", { jobId, status: "RUNNING_ML_MODEL" });
    console.log(`[ExternalUpload] [${jobId}] Calling ML API…`);

    const mlResult = await callMLAPI(transactionsUrl, accountsUrl);
    console.log(`[ExternalUpload] [${jobId}] ML API responded.`);

    // 3. Persist to MongoDB
    const record = await AnalysisResult.create({
      organization: req.user._id,
      transactions_cloudinary_url: transactionsUrl,
      accounts_cloudinary_url: accountsUrl,
      suspicious_accounts: mlResult.suspicious_accounts ?? [],
      fraud_rings: mlResult.fraud_rings ?? [],
      summary: mlResult.summary ?? {},
    });
    // 4. Check and send Fraud Alert Email
    try {
      const highRiskRings = (mlResult.fraud_rings || []).filter(r => r.risk_score > 50);
      if (highRiskRings.length > 0 && req.user.email) {
        const emailHtml = generateFraudAlertEmail(
          highRiskRings, 
          mlResult.suspicious_accounts, 
          req.user.organization_name
        );
        if (emailHtml) {
          await sendEmail(
            req.user.email,
            "🚨 Suspicious Activity Alert - GraphSentinal",
            "High-risk transaction rings detected. Please check the dashboard.",
            emailHtml
          );
        }
      }
    } catch (emailErr) {
      console.error(`[ExternalUpload] [${jobId}] [EmailAlertError]`, emailErr);
    }

    // 5. Completed
    io.to(bankId).emit("job_update", {
      jobId,
      status: "COMPLETED",
      data: {
        record_id: record._id,
        ml_response: mlResult,
        cloudinary_urls: { transactions: transactionsUrl, accounts: accountsUrl },
      },
    });
    console.log(`[ExternalUpload] [${jobId}] COMPLETED.`);
  } catch (error) {
    console.error(`[ExternalUpload] [${jobId}] FAILED:`, error.message);
    io.to(bankId).emit("job_update", {
      jobId,
      status: "FAILED",
      error: error.message,
    });
  }
}

export default { uploadController, externalUploadController };
