import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { useApp } from "./context/AppContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import AthleteProfilePage from "./pages/AthleteProfilePage";
import CoachProfilePage from "./pages/CoachProfilePage";
import MessagesPage from "./pages/MessagesPage";
import ChallengesPage from "./pages/ChallengesPage";
import SettingsPage from "./pages/SettingsPage";
import EditProfilePage from "./pages/EditProfilePage";

function getDashboardPath(user) {
  return user?.role === "coach" ? "/coach/dashboard" : "/athlete/dashboard";
}

function ProtectedRoute({ children }) {
  const { currentUser } = useApp();
  return currentUser ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
  const { currentUser } = useApp();
  return currentUser ? <Navigate to={getDashboardPath(currentUser)} replace /> : children;
}

function DashboardRedirect() {
  const { currentUser } = useApp();
  return <Navigate to={getDashboardPath(currentUser)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <SignupPage />
          </AuthRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/athlete/dashboard" element={<DashboardPage />} />
        <Route path="/coach/dashboard" element={<DashboardPage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/athletes/:athleteId" element={<AthleteProfilePage />} />
        <Route path="/coaches/:coachId" element={<CoachProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
