import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import CONFIG from "../config/config.js";



// Cloudinary config
cloudinary.config({
  cloud_name: CONFIG.CLOUDINARY_CLOUD_NAME,
  api_key: CONFIG.CLOUDINARY_API_KEY,
  api_secret: CONFIG.CLOUDINARY_API_SECRET,
  timeout: 120000, // 2 minutes — prevents 499 TimeoutError on large CSV uploads
});

export default cloudinary;
// Multer setup (store in memory)

// Upload CSV
