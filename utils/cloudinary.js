import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger.js";

// Ensure environment variables are loaded when this module initializes
dotenv.config({ path: ".env" });

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

export const isCloudinaryConfigured =
  !!CLOUDINARY_CLOUD_NAME && !!CLOUDINARY_API_KEY && !!CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  // Cloudinary configured for media uploads
} else {
  // Cloudinary not configured, falling back to local file storage
}

export { cloudinary };


