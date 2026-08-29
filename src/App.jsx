import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
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
const lazyImport = (loader) =>
  lazy(() =>
    loader().then((module) => ({
      default: module.default || module,
    }))
  );

const Home = lazyImport(() => import("./Overview/Home"));
const AboutUs = lazyImport(() => import("./Overview/AboutUs"));
const Team = lazyImport(() => import("./Overview/Team"));
const Contact = lazyImport(() => import("./Overview/Contact"));
const LTCAdminLogin = lazyImport(() => import("./Overview/LTCAdminLogin"));
const LTCAdminDashboard = lazyImport(() => import("./Overview/LTCAdminDashboard"));

/* ===================== HOTEL & RESTAURANT ===================== */
const ResortAndVenue = lazyImport(
  () => import("./HotelAndRestaurant/ResortAndVenue"),
);
const HotelOrCondo = lazyImport(() => import("./HotelAndRestaurant/HotelOrCondo"));
const EventPackage = lazyImport(() => import("./HotelAndRestaurant/EventPackage"));
const VirtualTour = lazyImport(() => import("./HotelAndRestaurant/VirtualTour"));
const EventForm = lazyImport(() => import("./HotelAndRestaurant/EventForm"));
const EventSummary = lazyImport(() => import("./HotelAndRestaurant/EventSummary"));
const ResortForm = lazyImport(() => import("./HotelAndRestaurant/ResortForm"));
const ResortSummary = lazyImport(() => import("./HotelAndRestaurant/ResortSummary"));
const HotelBookingForm = lazyImport(
  () => import("./HotelAndRestaurant/HotelBookingForm"),
);
const HotelBookingSummary = lazyImport(
  () => import("./HotelAndRestaurant/HotelBookingSummary"),
);
const HotelRecommendations = lazyImport(
  () => import("./HotelAndRestaurant/HotelRecommendations"),
);
const HotelGuestReviews = lazyImport(
  () => import("./HotelAndRestaurant/HotelGuestReviews"),
);
const HotelAdminReviews = lazyImport(
  () => import("./HotelAndRestaurant/HotelAdminReviews"),
);
const HotelChat = lazyImport(() => import("./HotelAndRestaurant/HotelChat"));
const HotelAdminChat = lazyImport(
  () => import("./HotelAndRestaurant/HotelAdminChat"),
);
const HotelFaqs = lazyImport(() => import("./HotelAndRestaurant/HotelFaqs"));
const HotelChatbot = lazyImport(() => import("./HotelAndRestaurant/HotelChatbot"));
const BookingSuccessful = lazyImport(
  () => import("./HotelAndRestaurant/BookingSuccessful"),
);

/* ===================== HOTEL AUTH ===================== */
const HotelLogIn = lazyImport(() => import("./HotelAndRestaurant/HotelLogIn"));
const HotelSignUp = lazyImport(() => import("./HotelAndRestaurant/HotelSignUp"));
const EmailConfirmation = lazyImport(
  () => import("./HotelAndRestaurant/EmailConfirmation"),
);
const HotelForgotPassword = lazyImport(
  () => import("./HotelAndRestaurant/HotelForgotPassword"),
);
const HotelResetPassword = lazyImport(
  () => import("./HotelAndRestaurant/HotelResetPassword"),
);
const HotelChangePassword = lazyImport(
  () => import("./HotelAndRestaurant/HotelChangePassword"),
);

/* ===================== HOTEL PROFILE ===================== */
const HotelProfile = lazyImport(() => import("./HotelAndRestaurant/HotelProfile"));
const HotelContactUs = lazyImport(
  () => import("./HotelAndRestaurant/HotelContactUs"),
);

/* ===================== HOTEL ADMIN ===================== */
const HotelAdminLogIn = lazyImport(
  () => import("./HotelAndRestaurant/HotelAdminLogIn"),
);
const HotelAdminDashboard = lazyImport(
  () => import("./HotelAndRestaurant/HotelAdminDashboard"),
);
const HotelAdminAccounts = lazyImport(
  () => import("./HotelAndRestaurant/HotelAdminAccounts"),
);
const HotelAdminBookings = lazyImport(
  () => import("./HotelAndRestaurant/HotelAdminBookings"),
);
const HotelAdminCheckInOut = lazyImport(
  () => import("./HotelAndRestaurant/HotelAdminCheckInOut"),
);
const HotelAdminIDVerify = lazyImport(
  () => import("./HotelAndRestaurant/HotelAdminIDVerify"),
);
const HotelAdminPackages = lazyImport(
  () => import("./HotelAndRestaurant/HotelAdminPackages"),
);

/* ===================== TRAINING & ASSESSMENT ===================== */
const TrainingAndAssessmentPage = lazyImport(
  () => import("./TrainingAndAssessment/TrainingAndAssessmentPage"),
);
const TrainingCourse = lazyImport(
  () => import("./TrainingAndAssessment/TrainingCourse"),
);
const TrainingEnrollmentForm = lazyImport(
  () => import("./TrainingAndAssessment/TrainingEnrollmentForm"),
);
const TrainingRequirements = lazyImport(
  () => import("./TrainingAndAssessment/TrainingRequirements"),
);
const TrainingContactUs = lazyImport(
  () => import("./TrainingAndAssessment/TrainingContactUs"),
);
const TrainingSubmit = lazyImport(
  () => import("./TrainingAndAssessment/TrainingSubmit"),
);
const TrainingFaqs = lazyImport(() => import("./TrainingAndAssessment/TrainingFaqs"));
const TrainingCertificateValidation = lazyImport(
  () => import("./TrainingAndAssessment/TrainingCertificateValidation"),
);

/* ===================== TRAINEE ===================== */
const TraineeLogIn = lazyImport(() => import("./TrainingAndAssessment/TraineeLogIn"));
const TraineeProfile = lazyImport(
  () => import("./TrainingAndAssessment/TraineeProfile"),
);
const TraineeModules = lazyImport(
  () => import("./TrainingAndAssessment/TraineeModules"),
);
const TraineeHome = lazyImport(() => import("./TrainingAndAssessment/TraineeHome"));
const TraineeAssignment = lazyImport(
  () => import("./TrainingAndAssessment/TraineeAssignment"),
);
const TraineeProgress = lazyImport(
  () => import("./TrainingAndAssessment/TraineeProgress"),
);
const TraineeAttendance = lazyImport(
  () => import("./TrainingAndAssessment/TraineeAttendance"),
);
const TraineeRoadmap = lazyImport(
  () => import("./TrainingAndAssessment/TraineeRoadmap"),
);
const TraineeForgotPassword = lazyImport(
  () => import("./TrainingAndAssessment/TraineeForgotPassword"),
);
const TrainingChangePassword = lazyImport(
  () => import("./TrainingAndAssessment/TraineeChangePassword"),
);
const TraineeRfidScan = lazyImport(
  () => import("./TrainingAndAssessment/TraineeRfidScan"),
);
const TraineeCertificate = lazyImport(
  () => import("./TrainingAndAssessment/TraineeCertificate"),
);

/* ===================== TRAINING ADMIN ===================== */
const TrainingAdminLogin = lazyImport(
  () => import("./TrainingAndAssessment/TrainingAdminLogin"),
);
const TrainingAdminEnrollments = lazyImport(
  () => import("./TrainingAndAssessment/TrainingAdminEnrollments"),
);
const TrainingAdminProfessors = lazyImport(
  () => import("./TrainingAndAssessment/TrainingAdminProfessors"),
);
const TrainingAdminCourses = lazyImport(
  () => import("./TrainingAndAssessment/TrainingAdminCourses"),
);
const TrainingAdminBatches = lazyImport(
  () => import("./TrainingAndAssessment/TrainingAdminBatches"),
);
const TrainingAdminRoadmap = lazyImport(
  () => import("./TrainingAndAssessment/TrainingAdminRoadmap"),
);
const TrainingAdminRegisterRfid = lazyImport(
  () => import("./TrainingAndAssessment/TrainingAdminRegisterRfid"),
);

/* ===================== PROFESSOR ===================== */
const ProfessorLogin = lazyImport(
  () => import("./TrainingAndAssessment/ProfessorLogin"),
);
const ProfessorDashboard = lazyImport(
  () => import("./TrainingAndAssessment/ProfessorDashboard"),
);
const ProfessorAttendance = lazyImport(
  () => import("./TrainingAndAssessment/ProfessorAttendance"),
);
const ProfessorProgress = lazyImport(
  () => import("./TrainingAndAssessment/ProfessorProgress"),
);
const ProfessorAssignments = lazyImport(
  () => import("./TrainingAndAssessment/ProfessorAssignments"),
);
const ProfessorModules = lazyImport(
  () => import("./TrainingAndAssessment/ProfessorModules"),
);
const ProfessorBatches = lazyImport(
  () => import("./TrainingAndAssessment/ProfessorBatches"),
);

/* ===================== MANPOWER SERVICES ===================== */
const ManpowerServicesPage = lazyImport(
  () => import("./ManpowerServices/ManpowerServicesPage"),
);
const ManpowerContact = lazyImport(
  () => import("./ManpowerServices/ManpowerContact"),
);
const ManpowerPositions = lazyImport(
  () => import("./ManpowerServices/ManpowerPositions"),
);
const ManpowerRequirements = lazyImport(
  () => import("./ManpowerServices/ManpowerRequirements"),
);
const ManpowerApply = lazyImport(() => import("./ManpowerServices/ManpowerApply"));
const ManpowerFaqs = lazyImport(() => import("./ManpowerServices/ManpowerFaqs"));
const ManpowerHrLogin = lazyImport(
  () => import("./ManpowerServices/ManpowerHrLogin"),
);
const ManpowerHrDashboard = lazyImport(
  () => import("./ManpowerServices/ManpowerHrDashboard"),
);
const ManpowerHrApplications = lazyImport(
  () => import("./ManpowerServices/ManpowerHrApplications"),
);
const ManpowerHrPayroll = lazyImport(
  () => import("./ManpowerServices/ManpowerHrPayroll"),
);
const ManpowerHrBilling = lazyImport(
  () => import("./ManpowerServices/ManpowerHrBilling"),
);
const ManpowerHrLeaves = lazyImport(
  () => import("./ManpowerServices/ManpowerHrLeaves"),
);
const ManpowerAdminLogin = lazyImport(
  () => import("./ManpowerServices/ManpowerAdminLogin"),
);
const ManpowerAdminDashboard = lazyImport(
  () => import("./ManpowerServices/ManpowerAdminDashboard"),
);
const ManpowerAdminAccounts = lazyImport(
  () => import("./ManpowerServices/ManpowerAdminAccounts"),
);
const ManpowerAdminJobs = lazyImport(
  () => import("./ManpowerServices/ManpowerAdminJobs"),
);
const ManpowerAdminHighlights = lazyImport(
  () => import("./ManpowerServices/ManpowerAdminHighlights"),
);
const ManpowerEmployeeLogin = lazyImport(
  () => import("./ManpowerServices/ManpowerEmployeeLogin"),
);
const ManpowerEmployeeHome = lazyImport(
  () => import("./ManpowerServices/ManpowerEmployeeHome"),
);
const ManpowerEmployeePayroll = lazyImport(
  () => import("./ManpowerServices/ManpowerEmployeePayroll"),
);
const ManpowerEmployeeProfile = lazyImport(
  () => import("./ManpowerServices/ManpowerEmployeeProfile"),
);
const ManpowerEmployeeLeave = lazyImport(
  () => import("./ManpowerServices/ManpowerEmployeeLeave"),
);
const ManpowerExam = lazyImport(() => import("./ManpowerServices/ManpowerExam"));
const ManpowerChatbot = lazyImport(
  () => import("./ManpowerServices/ManpowerChatbot"),
);
const ManpowerAdminDeductions = lazyImport(
  () => import("./ManpowerServices/ManpowerAdminDeductions"),
);
const ManpowerEmployeeChangePassword = lazyImport(
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
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
  const [assistantsReady, setAssistantsReady] = useState(false);

  const showHotelChatButton =
    HOTEL_CHAT_ALLOWED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    ) &&
    !HOTEL_CHAT_BLOCKED_PATH_PREFIXES.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

  const showManpowerChatbot = pathname.startsWith("/manpower");
  const shouldLoadAssistant = showHotelChatButton || showManpowerChatbot;

  useEffect(() => {
    if (!shouldLoadAssistant) {
      setAssistantsReady(false);
      return undefined;
    }

    let idleId;
    let timeoutId;

    const enable = () => setAssistantsReady(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(enable, 1000);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [shouldLoadAssistant]);

  if (!shouldLoadAssistant || !assistantsReady) return null;

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
            path="/hotel-admin-check-in-out"
            element={
              <AdminProtectedRoute>
                <HotelAdminCheckInOut />
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

      </Suspense>

      <Suspense fallback={null}>
        <FloatingAssistants />
      </Suspense>
    </Router>
  </StrictMode>,
);
