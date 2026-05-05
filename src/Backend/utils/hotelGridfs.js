import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";

let hotelBucket = null;

function getHotelBucketName() {
  return String(process.env.HOTEL_GRIDFS_BUCKET || "uploads").trim() || "uploads";
}

function toObjectId(value) {
  if (!value) return null;
  if (value instanceof ObjectId) return value;

  const raw = String(value || "").trim();
  return ObjectId.isValid(raw) ? new ObjectId(raw) : null;
}

function sanitizeFilename(name = "file") {
  return String(name || "file")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initHotelGridFS() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not ready for Hotel GridFS.");
  }

  hotelBucket = new GridFSBucket(db, {
    bucketName: getHotelBucketName(),
  });

  console.log(`✅ Hotel GridFS initialized (${getHotelBucketName()})`);
}

export function getHotelGridFSBucket() {
  if (!hotelBucket) {
    throw new Error("Hotel GridFS bucket is not initialized.");
  }

  return hotelBucket;
}

export async function uploadBufferToHotelGridFS(file, folder = "hotel") {
  if (!file || !file.buffer) return null;

  const activeBucket = getHotelGridFSBucket();

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
        module: "hotel",
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

export async function findHotelFileById(fileId) {
  const objectId = toObjectId(fileId);
  if (!objectId) return null;

  const files = await getHotelGridFSBucket().find({ _id: objectId }).toArray();
  return files?.[0] || null;
}

export function openHotelGridFSDownloadStream(fileId) {
  const objectId = toObjectId(fileId);

  if (!objectId) {
    throw new Error("Invalid Hotel GridFS file id.");
  }

  return getHotelGridFSBucket().openDownloadStream(objectId);
}

export async function deleteFileFromHotelGridFS(fileId) {
  const objectId = toObjectId(fileId);
  if (!objectId) return false;

  await getHotelGridFSBucket().delete(objectId);
  return true;
}

export default {
  initHotelGridFS,
  getHotelGridFSBucket,
  uploadBufferToHotelGridFS,
  findHotelFileById,
  openHotelGridFSDownloadStream,
  deleteFileFromHotelGridFS,
};