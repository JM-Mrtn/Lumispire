import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import hotelAdminRoutes from "./routes/hotelAdminRoutes.js";
import hotelRecommendationRoutes from "./routes/hotelRecommendationRoutes.js";
import hotelGuestReviewRoutes from "./routes/hotelGuestReviewRoutes.js";
import hotelChatRoutes from "./routes/hotelChatRoutes.js";
import hotelServicePackageRoutes from "./routes/hotelServicePackageRoutes.js";
import adminEnrollmentRoutes from "./routes/adminEnrollmentRoutes.js";
import trainingAdminRoutes from "./routes/trainingAdminRoutes.js";
import traineeRoutes from "./routes/traineeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import eventBookingRoutes from "./routes/eventBookingRoutes.js";
import hotelRoomBookingRoutes from "./routes/hotelRoomBookingRoutes.js";
import trainingFileRoutes from "./routes/trainingFileRoutes.js";
import manpowerAdminRoutes from "./routes/manpowerAdminRoutes.js";
import manpowerPublicRoutes from "./routes/manpowerPublicRoutes.js";
import manpowerAssessmentRoutes from "./routes/manpowerAssessmentRoutes.js";
import manpowerHrRoutes from "./routes/manpowerHrRoutes.js";
import manpowerEmployeeRoutes from "./routes/manpowerEmployeeRoutes.js";
import manpowerFileRoutes from "./routes/manpowerFileRoutes.js";
import professorRoutes from "./routes/professorRoutes.js";
import adminProfessorRoutes from "./routes/adminProfessorRoutes.js";
import adminCourseRoutes from "./routes/adminCourseRoutes.js";
import adminBatchRoutes from "./routes/adminBatchRoutes.js";
import adminRoadmapRoutes from "./routes/adminRoadmapRoutes.js";
import trainingRfidRoutes from "./routes/trainingRfidRoutes.js";
import ltcContentRoutes from "./routes/ltcContentRoutes.js";

import ProfessorAttendance from "./models/ProfessorAttendance.js";
import ProfessorAssessment from "./models/ProfessorAssessment.js";
import ProfessorScore from "./models/ProfessorScore.js";
import TraineeAssessmentSubmission from "./models/TraineeAssessmentSubmission.js";
import ProfessorUser from "./models/ProfessorUser.js";
import TrainingCourse from "./models/TrainingCourse.js";

import ResortBooking from "./models/ResortBooking.js";
import EventBooking from "./models/EventBooking.js";
import HotelRoomBooking from "./models/HotelRoomBooking.js";
import HotelUser from "./models/hotelUser.js";
import HotelIdVerification from "./models/HotelIdVerification.js";
import HotelGuestReview from "./models/HotelGuestReview.js";
import HotelChatMessage from "./models/HotelChatMessage.js";
import HotelServicePackage from "./models/HotelServicePackage.js";
import EnrollmentRequest from "./models/EnrollmentRequest.js";
import TraineeUser from "./models/TraineeUser.js";

import ManpowerIdScreening from "./models/ManpowerIdScreening.js";
import ManpowerApplication from "./models/ManpowerApplication.js";
import ManpowerEmployee from "./models/ManpowerEmployee.js";
import ManpowerPayroll from "./models/ManpowerPayroll.js";
import ManpowerJob from "./models/ManpowerJob.js";
import ManpowerDeductionConfig from "./models/ManpowerDeductionConfig.js";
import ManpowerLeave from "./models/ManpowerLeave.js";

import LtcContent from "./models/LtcContent.js";

import { initHotelGridFS } from "./utils/hotelGridfs.js";
import { initTrainingGridFS } from "./utils/trainingGridfs.js";
import { initManpowerGridFS } from "./utils/manpowerGridfs.js";
import { seedDefaultManpowerJobs } from "./utils/manpowerJobs.js";
import { seedTrainingCoursesFromExistingRecords } from "./utils/trainingCourseSeed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const port = process.env.PORT || 5000;
const isProduction = String(process.env.NODE_ENV || "").trim() === "production";

app.set("trust proxy", 1);

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0];

  return String(forwarded || req.ip || req.socket?.remoteAddress || "").trim();
}

function normalizeAddress(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^::ffff:/, "");
}

function isLocalRequest(req) {
  const ip = normalizeAddress(getClientIp(req));
  const hostname = normalizeAddress(req.hostname || "");

  return (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

function createJsonLimiter({ windowMs, max, message, skip }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    handler: (_req, res) => {
      return res.status(429).json({
        success: false,
        message,
      });
    },
  });
}

const generalApiLimiter = createJsonLimiter({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.API_RATE_LIMIT_MAX || 600),
  message: "Too many requests, please try again later.",
  skip: (req) => !isProduction || isLocalRequest(req),
});

const authLimiter = createJsonLimiter({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 15),
  message: "Too many login attempts, please try again later.",
  skip: (req) => !isProduction || isLocalRequest(req),
});

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/professors/login", authLimiter);
app.use("/api/admin/login", authLimiter);
app.use("/api/training/login", authLimiter);
app.use("/api/manpower/admin/login", authLimiter);
app.use("/api/manpower/hr/login", authLimiter);
app.use("/api/manpower/employee/login", authLimiter);
app.use("/api/hotel/hotel-login", authLimiter);
app.use("/api/hotel/admin-login", authLimiter);
app.use("/api/hotel-admin/admin-login", authLimiter);
app.use("/api/ltc/admin/login", authLimiter);

app.use("/api", generalApiLimiter);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    initHotelGridFS();
    initTrainingGridFS();
    initManpowerGridFS();

    await Promise.all([
      ResortBooking.syncIndexes(),
      EventBooking.syncIndexes(),
      HotelRoomBooking.syncIndexes(),
      HotelUser.syncIndexes(),
      HotelIdVerification.syncIndexes(),
      HotelGuestReview.syncIndexes(),
      HotelChatMessage.syncIndexes(),
      HotelServicePackage.syncIndexes(),

      EnrollmentRequest.syncIndexes(),
      TraineeUser.syncIndexes(),

      ManpowerIdScreening.syncIndexes(),
      ManpowerApplication.syncIndexes(),
      ManpowerEmployee.syncIndexes(),
      ManpowerPayroll.syncIndexes(),
      ManpowerJob.syncIndexes(),
      ManpowerDeductionConfig.syncIndexes(),
      ManpowerLeave.syncIndexes(),

      LtcContent.syncIndexes(),

      ProfessorAttendance.syncIndexes(),
      ProfessorAssessment.syncIndexes(),
      ProfessorScore.syncIndexes(),
      TraineeAssessmentSubmission.syncIndexes(),
      ProfessorUser.syncIndexes(),
      TrainingCourse.syncIndexes(),
    ]);

    console.log("Indexes synced");

    await seedTrainingCoursesFromExistingRecords();

    await seedDefaultManpowerJobs();
    console.log("Manpower default jobs synced");
  } catch (err) {
    console.error("MongoDB connection/index error:", err);
    process.exit(1);
  }
};

await connectDB();

/* ---------- LTC OVERVIEW CONTENT ---------- */
app.use("/api/ltc", ltcContentRoutes);

/* ---------- TRAINING / ENROLLMENT ---------- */
app.use("/api/training-files", trainingFileRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.use("/api/admin/enrollments", adminEnrollmentRoutes);
app.use("/api/admin/courses", adminCourseRoutes);
app.use("/api/admin/batches", adminBatchRoutes);
app.use("/api/admin/roadmap", adminRoadmapRoutes);
app.use("/api/admin/professors", adminProfessorRoutes);
app.use("/api/admin", trainingAdminRoutes);

app.use("/api/professors", professorRoutes);
app.use("/api/training/rfid", trainingRfidRoutes);
app.use("/api/training", traineeRoutes);

/* ---------- HOTEL ---------- */
app.use("/api/hotel", hotelRoutes);
app.use("/api/hotel", bookingRoutes);
app.use("/api/hotel", eventBookingRoutes);
app.use("/api/hotel", hotelRoomBookingRoutes);
app.use("/api/hotel", hotelRecommendationRoutes);
app.use("/api/hotel", hotelGuestReviewRoutes);
app.use("/api/hotel", hotelAdminRoutes);
app.use("/api/hotel/chat", hotelChatRoutes);
app.use("/api/hotel", hotelServicePackageRoutes);
app.use("/api/hotel-admin", hotelAdminRoutes);

/* ---------- MANPOWER ---------- */
app.use("/api/manpower/admin", manpowerAdminRoutes);
app.use("/api/manpower", manpowerPublicRoutes);
app.use("/api/manpower", manpowerAssessmentRoutes);
app.use("/api/manpower/hr", manpowerHrRoutes);
app.use("/api/manpower/employee", manpowerEmployeeRoutes);
app.use("/api/manpower/files", manpowerFileRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.get("/", (_req, res) => {
  res.status(200).send("API is running");
});

/* ---------- SOCKET.IO HOTEL CHAT ---------- */
const getHotelJwtSecret = () => {
  return (
    String(process.env.HOTEL_JWT_SECRET || "").trim() ||
    String(process.env.JWT_SECRET || "").trim() ||
    String(process.env.SECRET_KEY || "").trim()
  );
};

const getHotelAdminJwtSecret = () => {
  return (
    String(process.env.HOTEL_ADMIN_JWT_SECRET || "").trim() ||
    String(process.env.ADMIN_JWT_SECRET || "").trim() ||
    String(process.env.JWT_SECRET || "").trim() ||
    String(process.env.SECRET_KEY || "").trim()
  );
};

function getUserIdFromDecoded(decoded = {}) {
  return (
    decoded.id ||
    decoded._id ||
    decoded.userId ||
    decoded.hotelUserId ||
    decoded.sub ||
    ""
  );
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const role = socket.handshake.auth?.role || "user";

    if (!token) {
      return next(new Error("Socket token is required."));
    }

    if (role === "admin") {
      const secret = getHotelAdminJwtSecret();

      if (!secret) {
        return next(new Error("Hotel admin socket secret is missing."));
      }

      const decoded = jwt.verify(token, secret);
      const tokenRole = String(decoded?.role || decoded?.type || "").toLowerCase();

      const isHotelAdmin =
        decoded?.isHotelAdmin === true ||
        decoded?.hotelAdmin === true ||
        decoded?.scope === "hotel" ||
        tokenRole === "hotel_admin";

      if (!isHotelAdmin) {
        return next(new Error("Hotel admin socket access required."));
      }

      socket.data.role = "admin";
      socket.data.adminId = getUserIdFromDecoded(decoded) || "hotel-admin";

      return next();
    }

    const secret = getHotelJwtSecret();

    if (!secret) {
      return next(new Error("Hotel user socket secret is missing."));
    }

    const decoded = jwt.verify(token, secret);
    const userId = getUserIdFromDecoded(decoded);

    if (!userId) {
      return next(new Error("Invalid hotel user token."));
    }

    const user = await HotelUser.findById(userId).select(
      "active idVerificationStatus isIdentityVerified"
    );

    if (!user) {
      return next(new Error("Hotel user not found."));
    }

    if (user.active === false) {
      return next(new Error("Hotel user account is deactivated."));
    }

    const isVerified =
      user.isIdentityVerified === true ||
      user.idVerificationStatus === "verified";

    if (!isVerified) {
      return next(new Error("Hotel user is not ID verified."));
    }

    socket.data.role = "user";
    socket.data.userId = String(user._id);

    return next();
  } catch (error) {
    console.error("Socket auth error:", error?.message || error);
    return next(new Error("Socket authentication failed."));
  }
});

io.on("connection", (socket) => {
  if (socket.data.role === "admin") {
    socket.join("hotel-chat-admins");

    socket.on("hotelChat:joinAdmin", () => {
      socket.join("hotel-chat-admins");
    });

    socket.on("hotelChat:joinConversation", ({ userId } = {}) => {
      if (userId) {
        socket.join(`hotel-chat-user-${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Hotel admin chat socket disconnected:", socket.id);
    });

    return;
  }

  if (socket.data.role === "user") {
    const userId = socket.data.userId;

    socket.join(`hotel-chat-user-${userId}`);

    socket.on("hotelChat:joinMyConversation", () => {
      socket.join(`hotel-chat-user-${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Hotel user chat socket disconnected:", socket.id);
    });
  }
});

/* ---------- 404 AND ERROR HANDLERS ---------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, _req, res, _next) => {
  console.error("Server error:", err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }

  if (String(err.message || "").includes("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on("SIGINT", async () => {
  try {
    console.log("Closing server...");
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});