import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

const tempDirectory = path.join(os.tmpdir(), "ai-interview-ai", "uploads");
fs.mkdirSync(tempDirectory, { recursive: true });


// permanent storage for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, tempDirectory)
    },
    filename: function (req, file, cb) {
      cb(null, `${randomUUID()}${path.extname(file.originalname)}`)
    }
  })
  
export const upload = multer({ 
    storage, 
})

// temporary storage for resume uploads 

const memoryStorage = multer.memoryStorage();

export const uploadResume = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});