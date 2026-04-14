import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AccountManagement from "./pages/Admin/AccountManagement";
import ReportManagement from "./pages/Admin/ReportManagement";
import Teacher from "./pages/Admin/Teacher.jsx";
import QuizPage from "./pages/Quizzes/QuizPage";
import QuizResultPage from "./pages/Quizzes/QuizResultPage";
import DocumentsPage from "./pages/Documents/DocumentsPage";
import DocumentsDetailPage from "./pages/Documents/DocumentsDetailPage";
import AssignmentStatistics from "./pages/Quizzes/AssignmentStatistics";
import ProfilePage from "./pages/Profile/ProfilePage";
import AdminLayout from "./components/Layout/AdminLayout";
import TeacherLayout from "./components/Layout/TeacherLayout";

function PrivateRoute({ allowedRole }) {
  const raw  = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const role = user?.role || localStorage.getItem("role");
  return role === allowedRole ? <Outlet /> : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin */}
      <Route element={<PrivateRoute allowedRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index           element={<AdminDashboard />}    />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="content"  element={<ReportManagement />}  />
        </Route>
      </Route>

      {/* Teacher */}
      <Route element={<PrivateRoute allowedRole="teacher" />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index                element={<Teacher />}              />
          <Route path="quizzes"       element={<QuizPage />}             />
          <Route path="quiz-result"   element={<QuizResultPage />}       />
          <Route path="documents"     element={<DocumentsPage />}        />
          <Route path="documents/:id" element={<DocumentsDetailPage />}  />
          <Route path="stats"         element={<AssignmentStatistics />} />
          <Route path="profile"       element={<ProfilePage />}          />
        </Route>
      </Route>
    </Routes>
  );
}