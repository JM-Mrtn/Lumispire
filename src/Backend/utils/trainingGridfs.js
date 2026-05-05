import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";

let trainingBucket = null;

function toObjectId(value) {
  if (!value) return null;
  if (value instanceof ObjectId) return value;

  const str = String(value).trim();
  return ObjectId.isValid(str) ? new ObjectId(str) : null;
}

function sanitizeFilename(name = "file") {
  return String(name || "file")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initTrainingGridFS() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not ready for Training GridFS.");
  }

  trainingBucket = new GridFSBucket(db, {
    bucketName: "training_uploads",
  });

  console.log("✅ Training GridFS initialized");
}

export function getTrainingGridFSBucket() {
  if (!trainingBucket) {
    throw new Error("Training GridFS bucket is not initialized.");
  }

  return trainingBucket;
}

export async function uploadBufferToTrainingGridFS(file, folder = "training/general") {
  if (!file || !file.buffer) return null;

  const activeBucket = getTrainingGridFSBucket();

  return new Promise((resolve, reject) => {
    const safeOriginalName = sanitizeFilename(file.originalname || "file");
    const cleanName = `${Date.now()}-${safeOriginalName}`;
    const readable = Readable.from(file.buffer);

    const uploadStream = activeBucket.openUploadStream(cleanName, {
      contentType: file.mimetype || "application/octet-stream",
      metadata: {
        originalName: file.originalname || "file",
        folder,
        mimetype: file.mimetype || "application/octet-stream",
        size: Number(file.size || 0),
        scope: "training",
      },
    });

    readable
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => {
        resolve({
          fileId: uploadStream.id,
          originalName: file.originalname || "file",
          filename: cleanName,
          mimetype: file.mimetype || "application/octet-stream",
          size: Number(file.size || 0),
        });
      });
  });
}

export function openTrainingGridFSDownloadStream(fileId) {
  const activeBucket = getTrainingGridFSBucket();
  const objectId = toObjectId(fileId);

  if (!objectId) {
    throw new Error("Invalid Training GridFS file id.");
  }

  return activeBucket.openDownloadStream(objectId);
}

export async function deleteFileFromTrainingGridFS(fileId) {
  const objectId = toObjectId(fileId);
  if (!objectId) return false;

  const activeBucket = getTrainingGridFSBucket();
  await activeBucket.delete(objectId);
  return true;
}

export default {
  initTrainingGridFS,
  getTrainingGridFSBucket,
  uploadBufferToTrainingGridFS,
  openTrainingGridFSDownloadStream,
  deleteFileFromTrainingGridFS,
};