import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { Readable } from "stream";

const uploadOnCloudinary = async (fileInput) => {
  try {
    if (!fileInput) return null;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary environment variables are missing");
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Handle Buffer (Memory Storage)
    if (Buffer.isBuffer(fileInput)) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            
            const readableStream = new Readable();
            readableStream.push(fileInput);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }

    // Handle string (Local File Path)
    if (typeof fileInput === "string") {
        const response = await cloudinary.uploader.upload(fileInput, {
          resource_type: "auto",
        });

        if (fs.existsSync(fileInput)) {
            fs.unlinkSync(fileInput);
        }

        return response;
    }
    
    return null;
  } catch (error) {
    if (typeof fileInput === "string" && fs.existsSync(fileInput)) {
        try {
            fs.unlinkSync(fileInput);
        } catch (unlinkErr) {
            console.error("Error removing local temp file during error handling:", unlinkErr);
        }
    }
    
    throw error;
  }
};

// 🔥 PRODUCTION ADDITION: Delete old assets from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        console.error("Cloudinary Deletion Error:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };