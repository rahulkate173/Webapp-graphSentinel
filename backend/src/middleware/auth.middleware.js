import jwt from "jsonwebtoken";
import CONFIG from "../config/config.js";
import userModel from "../models/user.model.js";

async function protect(req, res, next) {
  try {
    // Accept token from cookie OR Authorization: Bearer <token>
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Not authenticated – no token provided" });
    }

    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User belonging to this token no longer exists" });
    }

    req.user = user;   // available as req.user._id, req.user.organization_name, etc.
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
async function verifyAPIKey(req, res, next) {
  try {
    // Accept both snake_case (form-data) and camelCase (JSON) field names
    const apiKey = req.body.api_key || req.body.apiKey || req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ error: "API key missing" });
    }

    const user = await userModel.findOne({ api_key: apiKey });
    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    if (user.verified !== true) {
      return res.status(401).json({ error: "API key not verified" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unexpected error during API key verification" });
  }
}

export default { protect, verifyAPIKey };
