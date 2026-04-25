import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware.js";
import uploadControllers from "../controllers/upload.controller.js";

// Memory storage — buffers passed directly to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// POST /api/files/upload-csv
// Accepts exactly 2 files under the key "files"
// Flow: auth → multer (2 files) → Cloudinary → ML API → MongoDB → response
router.post(
  "/upload-csv",
  authMiddleware.protect,
  upload.array("files", 2),
  uploadControllers.uploadController
);

router.post(
  "/external-upload-csv",
  upload.array("files", 2),    // ← multer first: parses multipart body → populates req.body + req.files
  authMiddleware.verifyAPIKey, // ← now req.body.apiKey is available
  uploadControllers.externalUploadController
);
export default router;