import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";

let manpowerBucket = null;

function getManpowerBucketName() {
  return String(process.env.MANPOWER_GRIDFS_BUCKET || "uploads").trim() || "uploads";
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

export function initManpowerGridFS() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not ready for Manpower GridFS.");
  }

  manpowerBucket = new GridFSBucket(db, {
    bucketName: getManpowerBucketName(),
  });

  console.log(`✅ Manpower GridFS initialized (${getManpowerBucketName()})`);
}

export function getManpowerGridFSBucket() {
  if (!manpowerBucket) {
    throw new Error("Manpower GridFS bucket is not initialized.");
  }

  return manpowerBucket;
}

export async function uploadBufferToManpowerGridFS({
  buffer,
  filename = "",
  originalName = "",
  contentType = "",
  mimetype = "",
  size = 0,
  folder = "manpower",
}) {
  if (!buffer) return null;

  const activeBucket = getManpowerGridFSBucket();

  const resolvedOriginalName =
    String(originalName || filename || "file").trim() || "file";

  const safeOriginalName = sanitizeFilename(resolvedOriginalName);
  const cleanName = `${Date.now()}-${safeOriginalName}`;
  const resolvedMimeType =
    String(contentType || mimetype || "application/octet-stream").trim() ||
    "application/octet-stream";

  return new Promise((resolve, reject) => {
    const readable = Readable.from(buffer);

    const uploadStream = activeBucket.openUploadStream(cleanName, {
      contentType: resolvedMimeType,
      metadata: {
        originalName: resolvedOriginalName,
        folder: String(folder || "manpower").trim() || "manpower",
        mimetype: resolvedMimeType,
        size: Number(size || 0),
      },
    });

    readable
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => {
        resolve({
          fileId: uploadStream.id,
          originalName: resolvedOriginalName,
          filename: cleanName,
          mimetype: resolvedMimeType,
          size: Number(size || 0),
        });
      });
  });
}

export async function findManpowerFileById(fileId) {
  const objectId = toObjectId(fileId);
  if (!objectId) return null;

  const files = await getManpowerGridFSBucket().find({ _id: objectId }).toArray();
  return files?.[0] || null;
}

export function openManpowerGridFSDownloadStream(fileId) {
  const objectId = toObjectId(fileId);

  if (!objectId) {
    throw new Error("Invalid Manpower GridFS file id.");
  }

  return getManpowerGridFSBucket().openDownloadStream(objectId);
}

export async function deleteFileFromManpowerGridFS(fileId) {
  const objectId = toObjectId(fileId);
  if (!objectId) return false;

  await getManpowerGridFSBucket().delete(objectId);
  return true;
}

export default {
  initManpowerGridFS,
  getManpowerGridFSBucket,
  uploadBufferToManpowerGridFS,
  findManpowerFileById,
  openManpowerGridFSDownloadStream,
  deleteFileFromManpowerGridFS,
};