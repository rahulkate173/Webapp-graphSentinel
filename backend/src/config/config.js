import dotenv from 'dotenv'
dotenv.config()

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables")
}
if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined")
}
if(!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET){
    throw new Error("Cloudinary configuration variables are not defined")
}
if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("Google OAuth configuration variables are not defined")
}
if(!process.env.REFRESH_TOKEN || !process.env.EMAIL_USER){
    throw new Error("Email configuration variables are not defined")
}
if(!process.env.SAR_ENCRYPTION_KEY){
    throw new Error("SAR_ENCRYPTION_KEY is not defined in environment variables (required for AES-256 draft storage)")
}
const CONFIG={
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    EMAIL_USER: process.env.EMAIL_USER,
    SAR_ENCRYPTION_KEY: process.env.SAR_ENCRYPTION_KEY,
}
export default CONFIG