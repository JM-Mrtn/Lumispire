import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./Main.css";

/* ===================== OVERVIEW ===================== */
import Home from "./Overview/Home";
import AboutUs from "./Overview/AboutUs";
import Team from "./Overview/Team";
import Contact from "./Overview/Contact";
import LTCAdminLogin from "./Overview/LTCAdminLogin";
import LTCAdminDashboard from "./Overview/LTCAdminDashboard";

/* ===================== HOTEL & RESTAURANT ===================== */
import HotelAndResortPage from "./HotelAndRestaurant/HotelAndResortPage";
import ResortAndVenue from "./HotelAndRestaurant/ResortAndVenue";
import HotelOrCondo from "./HotelAndRestaurant/HotelOrCondo";
import EventPackage from "./HotelAndRestaurant/EventPackage";
import VirtualTour from "./HotelAndRestaurant/VirtualTour";
import EventForm from "./HotelAndRestaurant/EventForm";
import EventSummary from "./HotelAndRestaurant/EventSummary";
import ResortForm from "./HotelAndRestaurant/ResortForm";
import ResortSummary from "./HotelAndRestaurant/ResortSummary";
import HotelBookingForm from "./HotelAndRestaurant/HotelBookingForm";
import HotelBookingSummary from "./HotelAndRestaurant/HotelBookingSummary";
import HotelRecommendations from "./HotelAndRestaurant/HotelRecommendations";
import HotelGuestReviews from "./HotelAndRestaurant/HotelGuestReviews";
import HotelAdminReviews from "./HotelAndRestaurant/HotelAdminReviews";
import HotelChat from "./HotelAndRestaurant/HotelChat";
import HotelAdminChat from "./HotelAndRestaurant/HotelAdminChat";
import HotelFaqs from "./HotelAndRestaurant/HotelFaqs";
import HotelChatButton from "./HotelAndRestaurant/HotelChatButton";

/* ===================== HOTEL AUTH ===================== */
import HotelLogIn from "./HotelAndRestaurant/HotelLogIn";
import HotelSignUp from "./HotelAndRestaurant/HotelSignUp";
import EmailConfirmation from "./HotelAndRestaurant/EmailConfirmation";
import HotelForgotPassword from "./HotelAndRestaurant/HotelForgotPassword";
import HotelResetPassword from "./HotelAndRestaurant/HotelResetPassword";
import HotelChangePassword from "./HotelAndRestaurant/HotelChangePassword";

/* ===================== HOTEL PROFILE ===================== */
import HotelProfile from "./HotelAndRestaurant/HotelProfile";
import HotelContactUs from "./HotelAndRestaurant/HotelContactUs";

/* ===================== HOTEL ADMIN ===================== */
import HotelAdminLogIn from "./HotelAndRestaurant/HotelAdminLogIn";
import HotelAdminDashboard from "./HotelAndRestaurant/HotelAdminDashboard";
import HotelAdminAccounts from "./HotelAndRestaurant/HotelAdminAccounts";
import HotelAdminBookings from "./HotelAndRestaurant/HotelAdminBookings";
import HotelAdminIDVerify from "./HotelAndRestaurant/HotelAdminIDVerify";
import HotelAdminPackages from "./HotelAndRestaurant/HotelAdminPackages";

/* ===================== TRAINING & ASSESSMENT ===================== */
import TrainingAndAssessmentPage from "./TrainingAndAssessment/TrainingAndAssessmentPage";
import TrainingCourse from "./TrainingAndAssessment/TrainingCourse";
import TrainingEnrollmentForm from "./TrainingAndAssessment/TrainingEnrollmentForm";
import TrainingRequirements from "./TrainingAndAssessment/TrainingRequirements";
import TrainingContactUs from "./TrainingAndAssessment/TrainingContactUs";
import TrainingSubmit from "./TrainingAndAssessment/TrainingSubmit";
import TrainingFaqs from "./TrainingAndAssessment/TrainingFaqs";

/* ===================== TRAINEE ===================== */
import TraineeLogIn from "./TrainingAndAssessment/TraineeLogIn";
import TraineeProfile from "./TrainingAndAssessment/TraineeProfile";
import TraineeModules from "./TrainingAndAssessment/TraineeModules";
import TraineeHome from "./TrainingAndAssessment/TraineeHome";
import TraineeAssignment from "./TrainingAndAssessment/TraineeAssignment";
import TraineeProgress from "./TrainingAndAssessment/TraineeProgress";
import TraineeAttendance from "./TrainingAndAssessment/TraineeAttendance";
import TraineeRoadmap from "./TrainingAndAssessment/TraineeRoadmap";
import TraineeForgotPassword from "./TrainingAndAssessment/TraineeForgotPassword";
import TrainingChangePassword from "./TrainingAndAssessment/TraineeChangePassword";
import TraineeRfidScan from "./TrainingAndAssessment/TraineeRfidScan";
import TraineeCertificate from "./TrainingAndAssessment/TraineeCertificate";

/* ===================== TRAINING ADMIN ===================== */
import TrainingAdminLogin from "./TrainingAndAssessment/TrainingAdminLogin";
import TrainingAdminEnrollments from "./TrainingAndAssessment/TrainingAdminEnrollments";
import TrainingAdminProfessors from "./TrainingAndAssessment/TrainingAdminProfessors";
import TrainingAdminCourses from "./TrainingAndAssessment/TrainingAdminCourses";
import TrainingAdminBatches from "./TrainingAndAssessment/TrainingAdminBatches";
import TrainingAdminRoadmap from "./TrainingAndAssessment/TrainingAdminRoadmap";
import TrainingAdminRegisterRfid from "./TrainingAndAssessment/TrainingAdminRegisterRfid";

/* ===================== PROFESSOR ===================== */
import ProfessorLandingPage from "./TrainingAndAssessment/ProfessorLandingPage";
import ProfessorLogin from "./TrainingAndAssessment/ProfessorLogin";
import ProfessorDashboard from "./TrainingAndAssessment/ProfessorDashboard";
import ProfessorAttendance from "./TrainingAndAssessment/ProfessorAttendance";
import ProfessorProgress from "./TrainingAndAssessment/ProfessorProgress";
import ProfessorAssignments from "./TrainingAndAssessment/ProfessorAssignments";
import ProfessorModules from "./TrainingAndAssessment/ProfessorModules";
import ProfessorBatches from "./TrainingAndAssessment/ProfessorBatches";

/* ===================== MANPOWER SERVICES ===================== */
import ManpowerServicesPage from "./ManpowerServices/ManpowerServicesPage";
import ManpowerContact from "./ManpowerServices/ManpowerContact";
import ManpowerPositions from "./ManpowerServices/ManpowerPositions";
import ManpowerRequirements from "./ManpowerServices/ManpowerRequirements";
import ManpowerApply from "./ManpowerServices/ManpowerApply";
import ManpowerFaqs from "./ManpowerServices/ManpowerFaqs";
import ManpowerHrLogin from "./ManpowerServices/ManpowerHrLogin";
import ManpowerHrDashboard from "./ManpowerServices/ManpowerHrDashboard";
import ManpowerHrApplications from "./ManpowerServices/ManpowerHrApplications";
import ManpowerHrPayroll from "./ManpowerServices/ManpowerHrPayroll";
import ManpowerHrBilling from "./ManpowerServices/ManpowerHrBilling";
import ManpowerHrLeaves from "./ManpowerServices/ManpowerHrLeaves";
import ManpowerAdminLogin from "./ManpowerServices/ManpowerAdminLogin";
import ManpowerAdminDashboard from "./ManpowerServices/ManpowerAdminDashboard";
import ManpowerAdminAccounts from "./ManpowerServices/ManpowerAdminAccounts";
import ManpowerAdminJobs from "./ManpowerServices/ManpowerAdminJobs";
import ManpowerAdminHighlights from "./ManpowerServices/ManpowerAdminHighlights";
import ManpowerEmployeeLogin from "./ManpowerServices/ManpowerEmployeeLogin";
import ManpowerEmployeeHome from "./ManpowerServices/ManpowerEmployeeHome";
import ManpowerEmployeePayroll from "./ManpowerServices/ManpowerEmployeePayroll";
import ManpowerEmployeeProfile from "./ManpowerServices/ManpowerEmployeeProfile";
import ManpowerEmployeeLeave from "./ManpowerServices/ManpowerEmployeeLeave";
import ManpowerExam from "./ManpowerServices/ManpowerExam";
import ManpowerChatbot from "./ManpowerServices/ManpowerChatbot";
import ManpowerAdminDeductions from "./ManpowerServices/ManpowerAdminDeductions";
import ManpowerEmployeeChangePassword from "./ManpowerServices/ManpowerEmployeeChangePassword";

/* ===================== HELPERS ===================== */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/* ===================== PROTECTED ROUTES ===================== */
const AdminProtectedRoute = ({ children }) => {
  const adminToken =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("hotelAdminToken");

  return adminToken ? children : <Navigate to="/hotel-admin-login" replace />;
};

const HotelProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
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
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    ) &&
    !HOTEL_CHAT_BLOCKED_PATH_PREFIXES.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

  const showManpowerChatbot = pathname.startsWith("/manpower");

  return (
    <>
      {showHotelChatButton ? <HotelChatButton /> : null}
      {showManpowerChatbot ? <ManpowerChatbot /> : null}
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <ScrollToTop />

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
        <Route path="/hotel-forgot-password" element={<HotelForgotPassword />} />
        <Route path="/hotel-reset-password/:token" element={<HotelResetPassword />} />

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
        <Route path="/training-assessment" element={<TrainingAndAssessmentPage />} />
        <Route path="/training" element={<TrainingAndAssessmentPage />} />

        <Route
          path="/training-home"
          element={<Navigate to="/training" replace />}
        />

        <Route path="/training-course" element={<TrainingCourse />} />
        <Route path="/training-enroll" element={<TrainingEnrollmentForm />} />
        <Route path="/training-requirements" element={<TrainingRequirements />} />
        <Route path="/training-contact-us" element={<TrainingContactUs />} />
        <Route path="/training-submit" element={<TrainingSubmit />} />
        <Route path="/training-faqs" element={<TrainingFaqs />} />

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
        <Route path="/trainee-forgot-password" element={<TraineeForgotPassword />} />

        <Route
          path="/training-change-password"
          element={<Navigate to="/trainee-change-password" replace />}
        />

        {/* ===================== TRAINING ADMIN ROUTES ===================== */}
        <Route path="/training-admin-login" element={<TrainingAdminLogin />} />

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
        <Route path="/professor" element={<ProfessorLandingPage />} />
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
        <Route path="/manpower-requirements" element={<ManpowerRequirements />} />

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

        <Route path="/manpower-admin-login" element={<ManpowerAdminLogin />} />

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

        <Route path="/manpower-employee-login" element={<ManpowerEmployeeLogin />} />

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

        <Route path="/manpower-exam/:applicationId" element={<ManpowerExam />} />

        {/* ===================== CATCH-ALL ===================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <FloatingAssistants />
    </Router>
  </StrictMode>
);