import { StrictMode, Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./Main.css";

/*
 * Vite gives lazy-loaded files a new hash after every deployment. If someone
 * keeps an older tab open, that tab can request a chunk that no longer exists.
 * Reload once so the browser receives the current index and current chunk map.
 */
const CHUNK_RECOVERY_KEY = "lumispireChunkRecovery";

if (typeof window !== "undefined" && !window.__lumispireChunkRecoveryInstalled) {
  window.__lumispireChunkRecoveryInstalled = true;

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.has("refresh")) {
    currentUrl.searchParams.delete("refresh");
    window.history.replaceState(null, "", currentUrl.toString());
  }

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();

    try {
      const now = Date.now();
      const lastRecovery = Number(sessionStorage.getItem(CHUNK_RECOVERY_KEY) || 0);

      if (now - lastRecovery < 30_000) {
        sessionStorage.removeItem(CHUNK_RECOVERY_KEY);
        return;
      }

      sessionStorage.setItem(CHUNK_RECOVERY_KEY, String(now));
      const freshUrl = new URL(window.location.href);
      freshUrl.searchParams.set("refresh", String(now));
      window.location.replace(freshUrl.toString());
    } catch {
      window.location.reload();
    }
  });
}

/* ===================== OVERVIEW ===================== */
import Home from "./Overview/Home";
const AboutUs = lazy(() => import("./Overview/AboutUs"));
const Team = lazy(() => import("./Overview/Team"));
const Contact = lazy(() => import("./Overview/Contact"));
const LTCAdminLogin = lazy(() => import("./Overview/LTCAdminLogin"));
const LTCAdminDashboard = lazy(() => import("./Overview/LTCAdminDashboard"));

/* ===================== HOTEL & RESTAURANT ===================== */
const HotelAndResortPage = lazy(
  () => import("./HotelAndRestaurant/HotelAndResortPage"),
);
const ResortAndVenue = lazy(
  () => import("./HotelAndRestaurant/ResortAndVenue"),
);
const HotelOrCondo = lazy(() => import("./HotelAndRestaurant/HotelOrCondo"));
const EventPackage = lazy(() => import("./HotelAndRestaurant/EventPackage"));
const VirtualTour = lazy(() => import("./HotelAndRestaurant/VirtualTour"));
const EventForm = lazy(() => import("./HotelAndRestaurant/EventForm"));
const EventSummary = lazy(() => import("./HotelAndRestaurant/EventSummary"));
const ResortForm = lazy(() => import("./HotelAndRestaurant/ResortForm"));
const ResortSummary = lazy(() => import("./HotelAndRestaurant/ResortSummary"));
const HotelBookingForm = lazy(
  () => import("./HotelAndRestaurant/HotelBookingForm"),
);
const HotelBookingSummary = lazy(
  () => import("./HotelAndRestaurant/HotelBookingSummary"),
);
const HotelRecommendations = lazy(
  () => import("./HotelAndRestaurant/HotelRecommendations"),
);
const HotelGuestReviews = lazy(
  () => import("./HotelAndRestaurant/HotelGuestReviews"),
);
const HotelAdminReviews = lazy(
  () => import("./HotelAndRestaurant/HotelAdminReviews"),
);
const HotelChat = lazy(() => import("./HotelAndRestaurant/HotelChat"));
const HotelAdminChat = lazy(
  () => import("./HotelAndRestaurant/HotelAdminChat"),
);
const HotelFaqs = lazy(() => import("./HotelAndRestaurant/HotelFaqs"));
const HotelChatbot = lazy(() => import("./HotelAndRestaurant/HotelChatbot"));
const BookingSuccessful = lazy(
  () => import("./HotelAndRestaurant/BookingSuccessful"),
);

/* ===================== HOTEL AUTH ===================== */
const HotelLogIn = lazy(() => import("./HotelAndRestaurant/HotelLogIn"));
const HotelSignUp = lazy(() => import("./HotelAndRestaurant/HotelSignUp"));
const EmailConfirmation = lazy(
  () => import("./HotelAndRestaurant/EmailConfirmation"),
);
const HotelForgotPassword = lazy(
  () => import("./HotelAndRestaurant/HotelForgotPassword"),
);
const HotelResetPassword = lazy(
  () => import("./HotelAndRestaurant/HotelResetPassword"),
);
const HotelChangePassword = lazy(
  () => import("./HotelAndRestaurant/HotelChangePassword"),
);

/* ===================== HOTEL PROFILE ===================== */
const HotelProfile = lazy(() => import("./HotelAndRestaurant/HotelProfile"));
const HotelContactUs = lazy(
  () => import("./HotelAndRestaurant/HotelContactUs"),
);

/* ===================== HOTEL ADMIN ===================== */
const HotelAdminLogIn = lazy(
  () => import("./HotelAndRestaurant/HotelAdminLogIn"),
);
const HotelAdminDashboard = lazy(
  () => import("./HotelAndRestaurant/HotelAdminDashboard"),
);
const HotelAdminAccounts = lazy(
  () => import("./HotelAndRestaurant/HotelAdminAccounts"),
);
const HotelAdminBookings = lazy(
  () => import("./HotelAndRestaurant/HotelAdminBookings"),
);
const HotelAdminIDVerify = lazy(
  () => import("./HotelAndRestaurant/HotelAdminIDVerify"),
);
const HotelAdminPackages = lazy(
  () => import("./HotelAndRestaurant/HotelAdminPackages"),
);

/* ===================== TRAINING & ASSESSMENT ===================== */
const TrainingAndAssessmentPage = lazy(
  () => import("./TrainingAndAssessment/TrainingAndAssessmentPage"),
);
const TrainingCourse = lazy(
  () => import("./TrainingAndAssessment/TrainingCourse"),
);
const TrainingEnrollmentForm = lazy(
  () => import("./TrainingAndAssessment/TrainingEnrollmentForm"),
);
const TrainingRequirements = lazy(
  () => import("./TrainingAndAssessment/TrainingRequirements"),
);
const TrainingContactUs = lazy(
  () => import("./TrainingAndAssessment/TrainingContactUs"),
);
const TrainingSubmit = lazy(
  () => import("./TrainingAndAssessment/TrainingSubmit"),
);
const TrainingFaqs = lazy(() => import("./TrainingAndAssessment/TrainingFaqs"));
const TrainingCertificateValidation = lazy(
  () => import("./TrainingAndAssessment/TrainingCertificateValidation"),
);

/* ===================== TRAINEE ===================== */
const TraineeLogIn = lazy(() => import("./TrainingAndAssessment/TraineeLogIn"));
const TraineeProfile = lazy(
  () => import("./TrainingAndAssessment/TraineeProfile"),
);
const TraineeModules = lazy(
  () => import("./TrainingAndAssessment/TraineeModules"),
);
const TraineeHome = lazy(() => import("./TrainingAndAssessment/TraineeHome"));
const TraineeAssignment = lazy(
  () => import("./TrainingAndAssessment/TraineeAssignment"),
);
const TraineeProgress = lazy(
  () => import("./TrainingAndAssessment/TraineeProgress"),
);
const TraineeAttendance = lazy(
  () => import("./TrainingAndAssessment/TraineeAttendance"),
);
const TraineeRoadmap = lazy(
  () => import("./TrainingAndAssessment/TraineeRoadmap"),
);
const TraineeForgotPassword = lazy(
  () => import("./TrainingAndAssessment/TraineeForgotPassword"),
);
const TrainingChangePassword = lazy(
  () => import("./TrainingAndAssessment/TraineeChangePassword"),
);
const TraineeRfidScan = lazy(
  () => import("./TrainingAndAssessment/TraineeRfidScan"),
);
const TraineeCertificate = lazy(
  () => import("./TrainingAndAssessment/TraineeCertificate"),
);

/* ===================== TRAINING ADMIN ===================== */
const TrainingAdminLogin = lazy(
  () => import("./TrainingAndAssessment/TrainingAdminLogin"),
);
const TrainingAdminEnrollments = lazy(
  () => import("./TrainingAndAssessment/TrainingAdminEnrollments"),
);
const TrainingAdminProfessors = lazy(
  () => import("./TrainingAndAssessment/TrainingAdminProfessors"),
);
const TrainingAdminCourses = lazy(
  () => import("./TrainingAndAssessment/TrainingAdminCourses"),
);
const TrainingAdminBatches = lazy(
  () => import("./TrainingAndAssessment/TrainingAdminBatches"),
);
const TrainingAdminRoadmap = lazy(
  () => import("./TrainingAndAssessment/TrainingAdminRoadmap"),
);
const TrainingAdminRegisterRfid = lazy(
  () => import("./TrainingAndAssessment/TrainingAdminRegisterRfid"),
);

/* ===================== PROFESSOR ===================== */
const ProfessorLogin = lazy(
  () => import("./TrainingAndAssessment/ProfessorLogin"),
);
const ProfessorDashboard = lazy(
  () => import("./TrainingAndAssessment/ProfessorDashboard"),
);
const ProfessorAttendance = lazy(
  () => import("./TrainingAndAssessment/ProfessorAttendance"),
);
const ProfessorProgress = lazy(
  () => import("./TrainingAndAssessment/ProfessorProgress"),
);
const ProfessorAssignments = lazy(
  () => import("./TrainingAndAssessment/ProfessorAssignments"),
);
const ProfessorModules = lazy(
  () => import("./TrainingAndAssessment/ProfessorModules"),
);
const ProfessorBatches = lazy(
  () => import("./TrainingAndAssessment/ProfessorBatches"),
);

/* ===================== MANPOWER SERVICES ===================== */
const ManpowerServicesPage = lazy(
  () => import("./ManpowerServices/ManpowerServicesPage"),
);
const ManpowerContact = lazy(
  () => import("./ManpowerServices/ManpowerContact"),
);
const ManpowerPositions = lazy(
  () => import("./ManpowerServices/ManpowerPositions"),
);
const ManpowerRequirements = lazy(
  () => import("./ManpowerServices/ManpowerRequirements"),
);
const ManpowerApply = lazy(() => import("./ManpowerServices/ManpowerApply"));
const ManpowerFaqs = lazy(() => import("./ManpowerServices/ManpowerFaqs"));
const ManpowerHrLogin = lazy(
  () => import("./ManpowerServices/ManpowerHrLogin"),
);
const ManpowerHrDashboard = lazy(
  () => import("./ManpowerServices/ManpowerHrDashboard"),
);
const ManpowerHrApplications = lazy(
  () => import("./ManpowerServices/ManpowerHrApplications"),
);
const ManpowerHrPayroll = lazy(
  () => import("./ManpowerServices/ManpowerHrPayroll"),
);
const ManpowerHrBilling = lazy(
  () => import("./ManpowerServices/ManpowerHrBilling"),
);
const ManpowerHrLeaves = lazy(
  () => import("./ManpowerServices/ManpowerHrLeaves"),
);
const ManpowerAdminLogin = lazy(
  () => import("./ManpowerServices/ManpowerAdminLogin"),
);
const ManpowerAdminDashboard = lazy(
  () => import("./ManpowerServices/ManpowerAdminDashboard"),
);
const ManpowerAdminAccounts = lazy(
  () => import("./ManpowerServices/ManpowerAdminAccounts"),
);
const ManpowerAdminJobs = lazy(
  () => import("./ManpowerServices/ManpowerAdminJobs"),
);
const ManpowerAdminHighlights = lazy(
  () => import("./ManpowerServices/ManpowerAdminHighlights"),
);
const ManpowerEmployeeLogin = lazy(
  () => import("./ManpowerServices/ManpowerEmployeeLogin"),
);
const ManpowerEmployeeHome = lazy(
  () => import("./ManpowerServices/ManpowerEmployeeHome"),
);
const ManpowerEmployeePayroll = lazy(
  () => import("./ManpowerServices/ManpowerEmployeePayroll"),
);
const ManpowerEmployeeProfile = lazy(
  () => import("./ManpowerServices/ManpowerEmployeeProfile"),
);
const ManpowerEmployeeLeave = lazy(
  () => import("./ManpowerServices/ManpowerEmployeeLeave"),
);
const ManpowerExam = lazy(() => import("./ManpowerServices/ManpowerExam"));
const ManpowerChatbot = lazy(
  () => import("./ManpowerServices/ManpowerChatbot"),
);
const ManpowerAdminDeductions = lazy(
  () => import("./ManpowerServices/ManpowerAdminDeductions"),
);
const ManpowerEmployeeChangePassword = lazy(
  () => import("./ManpowerServices/ManpowerEmployeeChangePassword"),
);

/* ===================== HELPERS ===================== */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PageFallback = () => (
  <div
    role="status"
    aria-live="polite"
    style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#f5f8f6",
      color: "#155f3b",
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
    }}
  >
    Loading page…
  </div>
);

/* ===================== PROTECTED ROUTES ===================== */
const AdminProtectedRoute = ({ children }) => {
  const adminToken =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("hotelAdminToken");

  return adminToken ? children : <Navigate to="/hotel-admin-login" replace />;
};

const HotelProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("hotelToken");
  return token ? children : <Navigate to="/hotel-login" replace />;
};

const TrainingAdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("trainingAdminToken");
  return token ? children : <Navigate to="/training-admin-login" replace />;
};

const ProfessorProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("professorToken");
  return token ? children : <Navigate to="/professor-login" replace />;
};

const TraineeProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("trainingToken");
  return token ? children : <Navigate to="/trainee-login" replace />;
};

const ManpowerHrProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("manpowerHrToken");
  return token ? children : <Navigate to="/manpower-hr-login" replace />;
};

const ManpowerAdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("manpowerAdminToken");
  return token ? children : <Navigate to="/manpower-admin-login" replace />;
};

const ManpowerEmployeeProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("manpowerEmployeeToken");
  return token ? children : <Navigate to="/manpower-employee-login" replace />;
};

const LtcAdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("ltcAdminToken");
  return token ? children : <Navigate to="/ltc-admin-login" replace />;
};

const HOTEL_CHAT_ALLOWED_PATHS = [
  "/hotel-resort",
  "/resort-venue",
  "/hotel-condo",
  "/event-package",
  "/virtual-tour",
  "/hotel-faqs",
  "/hotel-contact-us",
  "/hotel-profile",
  "/hotel-guest-reviews",
  "/hotel-recommendations",
  "/event-form",
  "/event-summary",
  "/resort-form",
  "/resort-summary",
  "/hotel-booking-form",
  "/hotel-booking-summary",
];

const HOTEL_CHAT_BLOCKED_PATH_PREFIXES = [
  "/hotel-chat",
  "/hotel-admin",
  "/hotel-login",
  "/hotel-signup",
  "/hotel-forgot-password",
  "/hotel-reset-password",
  "/hotel-change-password",
  "/email-confirmation",
];

const FloatingAssistants = () => {
  const { pathname } = useLocation();

  const showHotelChatButton =
    HOTEL_CHAT_ALLOWED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    ) &&
    !HOTEL_CHAT_BLOCKED_PATH_PREFIXES.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

  const showManpowerChatbot = pathname.startsWith("/manpower");

  return (
    <>
      {showHotelChatButton ? <HotelChatbot /> : null}
      {showManpowerChatbot ? <ManpowerChatbot /> : null}
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <ScrollToTop />

      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* ===================== OVERVIEW ROUTES ===================== */}
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ltc-admin-login" element={<LTCAdminLogin />} />
          <Route
            path="/ltc-admin-dashboard"
            element={
              <LtcAdminProtectedRoute>
                <LTCAdminDashboard />
              </LtcAdminProtectedRoute>
            }
          />

          {/* ===================== HOTEL & RESTAURANT ROUTES ===================== */}
          <Route path="/hotel-resort" element={<HotelAndResortPage />} />
          <Route path="/resort-venue" element={<ResortAndVenue />} />
          <Route path="/hotel-condo" element={<HotelOrCondo />} />
          <Route path="/event-package" element={<EventPackage />} />
          <Route path="/virtual-tour" element={<VirtualTour />} />
          <Route path="/hotel-faqs" element={<HotelFaqs />} />
          <Route path="/booking-successful" element={<BookingSuccessful />} />

          <Route
            path="/event-form"
            element={
              <HotelProtectedRoute>
                <EventForm />
              </HotelProtectedRoute>
            }
          />

          <Route
            path="/event-summary"
            element={
              <HotelProtectedRoute>
                <EventSummary />
              </HotelProtectedRoute>
            }
          />

          <Route
            path="/resort-form"
            element={
              <HotelProtectedRoute>
                <ResortForm />
              </HotelProtectedRoute>
            }
          />

          <Route
            path="/resort-summary"
            element={
              <HotelProtectedRoute>
                <ResortSummary />
              </HotelProtectedRoute>
            }
          />

          <Route
            path="/hotel-booking-form"
            element={
              <HotelProtectedRoute>
                <HotelBookingForm />
              </HotelProtectedRoute>
            }
          />

          <Route
            path="/hotel-booking-summary"
            element={
              <HotelProtectedRoute>
                <HotelBookingSummary />
              </HotelProtectedRoute>
            }
          />

          <Route
            path="/hotel-recommendations"
            element={
              <HotelProtectedRoute>
                <HotelRecommendations />
              </HotelProtectedRoute>
            }
          />

          {/* ===================== HOTEL AUTH ROUTES ===================== */}
          <Route path="/hotel-login" element={<HotelLogIn />} />
          <Route path="/hotel-signup" element={<HotelSignUp />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route
            path="/email-confirmation/:verificationToken"
            element={<EmailConfirmation />}
          />
          <Route
            path="/hotel-forgot-password"
            element={<HotelForgotPassword />}
          />
          <Route
            path="/hotel-reset-password/:token"
            element={<HotelResetPassword />}
          />
          <Route
            path="/hotel-reset-password"
            element={<HotelResetPassword />}
          />

          <Route
            path="/hotel-change-password"
            element={
              <HotelProtectedRoute>
                <HotelChangePassword />
              </HotelProtectedRoute>
            }
          />

          {/* ===================== HOTEL PROFILE ROUTES ===================== */}
          <Route
            path="/hotel-profile"
            element={
              <HotelProtectedRoute>
                <HotelProfile />
              </HotelProtectedRoute>
            }
          />

          <Route
            path="/hotel-guest-reviews"
            element={
              <HotelProtectedRoute>
                <HotelGuestReviews />
              </HotelProtectedRoute>
            }
          />

          <Route path="/hotel-contact-us" element={<HotelContactUs />} />

          <Route
            path="/hotel-chat"
            element={
              <HotelProtectedRoute>
                <HotelChat />
              </HotelProtectedRoute>
            }
          />

          {/* ===================== HOTEL ADMIN ROUTES ===================== */}
          <Route path="/hotel-admin-login" element={<HotelAdminLogIn />} />

          <Route
            path="/hotel-admin-dashboard"
            element={
              <AdminProtectedRoute>
                <HotelAdminDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/hotel-admin-packages"
            element={
              <AdminProtectedRoute>
                <HotelAdminPackages />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/hotel-admin-chat"
            element={
              <AdminProtectedRoute>
                <HotelAdminChat />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/hotel-admin-accounts"
            element={
              <AdminProtectedRoute>
                <HotelAdminAccounts />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/hotel-admin-bookings"
            element={
              <AdminProtectedRoute>
                <HotelAdminBookings />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/hotel-admin-reviews"
            element={
              <AdminProtectedRoute>
                <HotelAdminReviews />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/hotel-admin-accounts/:userId/edit"
            element={<Navigate to="/hotel-admin-accounts" replace />}
          />

          <Route
            path="/hotel-admin-id-verify"
            element={
              <AdminProtectedRoute>
                <HotelAdminIDVerify />
              </AdminProtectedRoute>
            }
          />

          {/* ===================== TRAINING & ASSESSMENT ROUTES ===================== */}
          <Route
            path="/training-assessment"
            element={<TrainingAndAssessmentPage />}
          />
          <Route path="/training" element={<TrainingAndAssessmentPage />} />

          <Route
            path="/training-home"
            element={<Navigate to="/training" replace />}
          />

          <Route path="/training-course" element={<TrainingCourse />} />
          <Route path="/training-enroll" element={<TrainingEnrollmentForm />} />
          <Route
            path="/training-requirements"
            element={<TrainingRequirements />}
          />
          <Route path="/training-contact-us" element={<TrainingContactUs />} />
          <Route path="/training-submit" element={<TrainingSubmit />} />
          <Route path="/training-faqs" element={<TrainingFaqs />} />
          <Route
            path="/training-certificate-validation"
            element={<TrainingCertificateValidation />}
          />

          {/* ===== Compatibility redirects for old trainee/public links ===== */}
          <Route
            path="/training-login"
            element={<Navigate to="/trainee-login" replace />}
          />

          <Route
            path="/trainee-assessment"
            element={<Navigate to="/trainee-assignment" replace />}
          />

          <Route path="/Home" element={<Navigate to="/" replace />} />

          <Route
            path="/training-faqs"
            element={<Navigate to="/training-faqs" replace />}
          />

          {/* ===================== TRAINEE ROUTES ===================== */}
          <Route path="/trainee-login" element={<TraineeLogIn />} />

          <Route
            path="/trainee-certificate"
            element={
              <TraineeProtectedRoute>
                <TraineeCertificate />
              </TraineeProtectedRoute>
            }
          />

          <Route
            path="/trainee-profile"
            element={
              <TraineeProtectedRoute>
                <TraineeProfile />
              </TraineeProtectedRoute>
            }
          />

          <Route
            path="/trainee-change-password"
            element={
              <TraineeProtectedRoute>
                <TrainingChangePassword />
              </TraineeProtectedRoute>
            }
          />

          <Route
            path="/trainee-home"
            element={
              <TraineeProtectedRoute>
                <TraineeHome />
              </TraineeProtectedRoute>
            }
          />

          <Route
            path="/trainee-roadmap"
            element={
              <TraineeProtectedRoute>
                <TraineeRoadmap />
              </TraineeProtectedRoute>
            }
          />

          <Route
            path="/trainee-modules"
            element={
              <TraineeProtectedRoute>
                <TraineeModules />
              </TraineeProtectedRoute>
            }
          />

          <Route
            path="/trainee-assignment"
            element={
              <TraineeProtectedRoute>
                <TraineeAssignment />
              </TraineeProtectedRoute>
            }
          />

          <Route
            path="/trainee-progress"
            element={
              <TraineeProtectedRoute>
                <TraineeProgress />
              </TraineeProtectedRoute>
            }
          />

          <Route
            path="/trainee-attendance"
            element={
              <TraineeProtectedRoute>
                <TraineeAttendance />
              </TraineeProtectedRoute>
            }
          />

          <Route path="/trainee-rfid-scan" element={<TraineeRfidScan />} />
          <Route
            path="/trainee-forgot-password"
            element={<TraineeForgotPassword />}
          />

          <Route
            path="/training-change-password"
            element={<Navigate to="/trainee-change-password" replace />}
          />

          {/* ===================== TRAINING ADMIN ROUTES ===================== */}
          <Route
            path="/training-admin-login"
            element={<TrainingAdminLogin />}
          />

          <Route
            path="/training-admin-enrollments"
            element={
              <TrainingAdminProtectedRoute>
                <TrainingAdminEnrollments />
              </TrainingAdminProtectedRoute>
            }
          />

          <Route
            path="/training-admin-courses"
            element={
              <TrainingAdminProtectedRoute>
                <TrainingAdminCourses />
              </TrainingAdminProtectedRoute>
            }
          />

          <Route
            path="/training-admin-roadmap"
            element={
              <TrainingAdminProtectedRoute>
                <TrainingAdminRoadmap />
              </TrainingAdminProtectedRoute>
            }
          />

          <Route
            path="/training-admin-batches"
            element={
              <TrainingAdminProtectedRoute>
                <TrainingAdminBatches />
              </TrainingAdminProtectedRoute>
            }
          />

          <Route
            path="/training-admin-professors"
            element={
              <TrainingAdminProtectedRoute>
                <TrainingAdminProfessors />
              </TrainingAdminProtectedRoute>
            }
          />

          <Route
            path="/training-admin-register-rfid"
            element={
              <TrainingAdminProtectedRoute>
                <TrainingAdminRegisterRfid />
              </TrainingAdminProtectedRoute>
            }
          />

          {/* ===================== PROFESSOR ROUTES ===================== */}
          <Route path="/professor-login" element={<ProfessorLogin />} />

          <Route
            path="/professor-dashboard"
            element={
              <ProfessorProtectedRoute>
                <ProfessorDashboard />
              </ProfessorProtectedRoute>
            }
          />

          <Route
            path="/professor-batches"
            element={
              <ProfessorProtectedRoute>
                <ProfessorBatches />
              </ProfessorProtectedRoute>
            }
          />

          <Route
            path="/professor-attendance"
            element={
              <ProfessorProtectedRoute>
                <ProfessorAttendance />
              </ProfessorProtectedRoute>
            }
          />

          <Route
            path="/professor-progress"
            element={
              <ProfessorProtectedRoute>
                <ProfessorProgress />
              </ProfessorProtectedRoute>
            }
          />

          <Route
            path="/professor-assessments"
            element={
              <ProfessorProtectedRoute>
                <ProfessorAssignments />
              </ProfessorProtectedRoute>
            }
          />

          <Route
            path="/professor-modules"
            element={
              <ProfessorProtectedRoute>
                <ProfessorModules />
              </ProfessorProtectedRoute>
            }
          />

          {/* ===================== MANPOWER ROUTES ===================== */}
          <Route path="/manpower-services" element={<ManpowerServicesPage />} />

          <Route
            path="/manpower"
            element={<Navigate to="/manpower-services" replace />}
          />

          <Route path="/manpower-apply" element={<ManpowerApply />} />
          <Route path="/manpower-contact" element={<ManpowerContact />} />
          <Route path="/manpower-positions" element={<ManpowerPositions />} />
          <Route path="/manpower-faqs" element={<ManpowerFaqs />} />
          <Route
            path="/manpower-requirements"
            element={<ManpowerRequirements />}
          />

          <Route path="/manpower-hr-login" element={<ManpowerHrLogin />} />

          <Route
            path="/manpower-hr"
            element={
              <ManpowerHrProtectedRoute>
                <ManpowerHrDashboard />
              </ManpowerHrProtectedRoute>
            }
          />

          <Route
            path="/manpower-hr-applications"
            element={
              <ManpowerHrProtectedRoute>
                <ManpowerHrApplications />
              </ManpowerHrProtectedRoute>
            }
          />

          <Route
            path="/manpower-hr-payroll"
            element={
              <ManpowerHrProtectedRoute>
                <ManpowerHrPayroll />
              </ManpowerHrProtectedRoute>
            }
          />

          <Route
            path="/manpower-hr-billing"
            element={
              <ManpowerHrProtectedRoute>
                <ManpowerHrBilling />
              </ManpowerHrProtectedRoute>
            }
          />

          <Route
            path="/manpower-hr-leaves"
            element={
              <ManpowerHrProtectedRoute>
                <ManpowerHrLeaves />
              </ManpowerHrProtectedRoute>
            }
          />

          <Route
            path="/manpower-admin-login"
            element={<ManpowerAdminLogin />}
          />

          <Route
            path="/manpower-admin"
            element={
              <ManpowerAdminProtectedRoute>
                <ManpowerAdminDashboard />
              </ManpowerAdminProtectedRoute>
            }
          />

          <Route
            path="/manpower-admin-dashboard"
            element={<Navigate to="/manpower-admin" replace />}
          />

          <Route
            path="/manpower-admin-jobs"
            element={
              <ManpowerAdminProtectedRoute>
                <ManpowerAdminJobs />
              </ManpowerAdminProtectedRoute>
            }
          />

          <Route
            path="/manpower-admin-highlights"
            element={
              <ManpowerAdminProtectedRoute>
                <ManpowerAdminHighlights />
              </ManpowerAdminProtectedRoute>
            }
          />

          <Route
            path="/manpower-admin-accounts"
            element={
              <ManpowerAdminProtectedRoute>
                <ManpowerAdminAccounts />
              </ManpowerAdminProtectedRoute>
            }
          />

          <Route
            path="/manpower-admin-deductions"
            element={
              <ManpowerAdminProtectedRoute>
                <ManpowerAdminDeductions />
              </ManpowerAdminProtectedRoute>
            }
          />

          <Route
            path="/manpower-employee-login"
            element={<ManpowerEmployeeLogin />}
          />

          <Route
            path="/manpower-employee-home"
            element={
              <ManpowerEmployeeProtectedRoute>
                <ManpowerEmployeeHome />
              </ManpowerEmployeeProtectedRoute>
            }
          />

          <Route
            path="/manpower-employee-payroll"
            element={
              <ManpowerEmployeeProtectedRoute>
                <ManpowerEmployeePayroll />
              </ManpowerEmployeeProtectedRoute>
            }
          />

          <Route
            path="/manpower-employee-profile"
            element={
              <ManpowerEmployeeProtectedRoute>
                <ManpowerEmployeeProfile />
              </ManpowerEmployeeProtectedRoute>
            }
          />

          <Route
            path="/manpower-employee-leave"
            element={
              <ManpowerEmployeeProtectedRoute>
                <ManpowerEmployeeLeave />
              </ManpowerEmployeeProtectedRoute>
            }
          />

          <Route
            path="/manpower-employee-change-password"
            element={
              <ManpowerEmployeeProtectedRoute>
                <ManpowerEmployeeChangePassword />
              </ManpowerEmployeeProtectedRoute>
            }
          />

          <Route
            path="/manpower-exam/:applicationId"
            element={<ManpowerExam />}
          />

          {/* ===================== CATCH-ALL ===================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <FloatingAssistants />
      </Suspense>
    </Router>
  </StrictMode>,
);
