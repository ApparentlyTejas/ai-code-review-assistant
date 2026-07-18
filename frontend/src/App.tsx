import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ProjectList } from "./pages/ProjectList";
import { Register } from "./pages/Register";
import { ReviewDetail } from "./pages/ReviewDetail";
import { ReviewHistory } from "./pages/ReviewHistory";
import { VerifyEmail } from "./pages/VerifyEmail";
import { GitHubCallback } from "./pages/GitHubCallback";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/projects/:projectId/reviews" element={<ReviewHistory />} />
          <Route path="/projects/:projectId/reviews/:reviewId" element={<ReviewDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
