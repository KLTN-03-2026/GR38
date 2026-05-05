import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Layout & Pages
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";

// Auth
import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";
import ForgotPasswordPage from "./components/Modal/Auth/ForgotPasswordForm";
import ProfilePage from "./components/Profile/ProfilePage.jsx";

// Admin
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AccountManagement from "./pages/Admin/AccountManagement";
import ReportManagement from "./pages/Admin/ReportManagement";

// Teacher
import Teacher from "./pages/Admin/Teacher.jsx";
import QuizPage from "./pages/Teacher/Quizzes/QuizPage.jsx";
import QuizResultPage from "./pages/Teacher/Quizzes/QuizResultPage.jsx";
import DocumentsPage from "./pages/Teacher/Documents/DocumentsPage.jsx";
import DocumentsDetailPage from "./pages/Teacher/Documents/DocumentsDetailPage.jsx";
import AssignmentStatistics from "./pages/Teacher/Quizzes/AssignmentStatistics.jsx";
import Baigiangpage from "./pages/Teacher/Documents/Baigiangpage.jsx";
import Baikiemtra from "./pages/Teacher/Documents/Baikiemtra.jsx";
import Flashcards from "./pages/Teacher/Flashcards/FlashcardPage.jsx";
import AddFlashcards from "./pages/Teacher/Flashcards/AddFlashcard.jsx";
import FlashcardDetail from "./pages/Teacher/Flashcards/FlashcardDetail.jsx";

// Learner
import Dashboard from "./pages/Learner/Dashboard";
import BaiGiang from "./pages/Learner/BaiGiang/BaiGiang";
import ChatAI from "./pages/Learner/BaiGiang/ChatAI";
import FlashCard from "./pages/Learner/BaiGiang/FlashCard";
import Quiz from "./pages/Learner/BaiGiang/Quizz.jsx";
import BaiKiemTra from "./pages/Learner/Baikiemtra/Baikiemtra";
import FlashcardDetailLearner from "./pages/Learner/HocFlashCard/FlashcardDetail";
import HocQuiz from "./pages/Learner/HocQuizz/HocQuizz.jsx";
import DocumentsLearner from "./pages/Learner/Documents";
import FlashcardsLearner from "./pages/Learner/Flashcards.jsx";
import QuizzesLearner from "./pages/Learner/Quizzes";
import SuCo from "./pages/Learner/SuCo";
import TienDo from "./pages/Learner/TienDo";

// PrivateRoute logic
function PrivateRoute({ allowedRole }) {
  const { user, role, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  if (!user) return <Navigate to="/" replace />;
  return role === allowedRole ? <Outlet /> : <Navigate to="/" replace />;
}

// PublicRoute logic
function PublicRoute() {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Outlet />;
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "TEACHER") return <Navigate to="/teacher" replace />;
  return <Navigate to="/learner" replace />;
}

// App Layout
function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[220px]">
        <Header />
        <main className="flex-1 p-6 mt-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* CẤU HÌNH ADMIN: Đã thêm các mục tài liệu, flashcards, quizzes */}
      <Route element={<PrivateRoute allowedRole="ADMIN" />}>
        <Route path="/admin" element={<AppLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="content" element={<ReportManagement />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Các Route mới để Admin có thể xem được nội dung */}
          <Route path="documents" element={<DocumentsLearner />} />
          <Route path="flashcards" element={<FlashcardsLearner />} />
          <Route path="quizzes" element={<QuizzesLearner />} />
        </Route>
      </Route>

      {/* TEACHER AREA */}
      <Route element={<PrivateRoute allowedRole="TEACHER" />}>
        <Route path="/teacher" element={<AppLayout />}>
          <Route index element={<Teacher />} />
          <Route path="quizzes" element={<QuizPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="stats" element={<AssignmentStatistics />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* LEARNER AREA */}
      <Route element={<PrivateRoute allowedRole="LEARNER" />}>
        <Route path="/learner" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<DocumentsLearner />} />
          <Route path="flashcards" element={<FlashcardsLearner />} />
          <Route path="quizzes" element={<QuizzesLearner />} />
          <Route path="suco" element={<SuCo />} />
          <Route path="tiendo" element={<TienDo />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
