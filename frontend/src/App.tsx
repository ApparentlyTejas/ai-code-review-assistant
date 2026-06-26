import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Login } from "./pages/Login";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ProjectList } from "./pages/ProjectList";
import { Register } from "./pages/Register";
import { ReviewDetail } from "./pages/ReviewDetail";
import { ReviewHistory } from "./pages/ReviewHistory";

export default function App() {
  return (
    <main className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/projects/:projectId/reviews" element={<ReviewHistory />} />
          <Route path="/projects/:projectId/reviews/:reviewId" element={<ReviewDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </main>
  );
}
