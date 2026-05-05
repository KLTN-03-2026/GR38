import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// ================= LAYOUT & PAGES IMPORTS =================
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";

import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";
import ForgotPasswordPage from "./components/Modal/Auth/ForgotPasswordForm";
import ProfilePage from "./components/Profile/ProfilePage.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AccountManagement from "./pages/Admin/AccountManagement";
import ReportManagement from "./pages/Admin/ReportManagement";

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

function PrivateRoute({ allowedRole }) {
  const { user, role, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải hệ thống...</div>;
  }
  if (!user) return <Navigate to="/" replace />;
  return role === allowedRole ? <Outlet /> : <Navigate to="/" replace />;
}

function PublicRoute() {
  const { user, role, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải hệ thống...</div>;
  }
  if (!user) return <Outlet />;
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "TEACHER") return <Navigate to="/teacher" replace />;
  if (role === "LEARNER") return <Navigate to="/learner" replace />;
  return <Outlet />;
}

function AppLayout({ mlWidth = "ml-[220px]" }) {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className={`flex-1 flex flex-col ${mlWidth}`}>
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

      {/* ADMIN ROUTES - GIỮ NGUYÊN TUYỆT ĐỐI */}
      <Route element={<PrivateRoute allowedRole="ADMIN" />}>
        <Route path="/admin" element={<AppLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="content" element={<ReportManagement />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* TEACHER ROUTES - GIỮ NGUYÊN TUYỆT ĐỐI */}
      <Route element={<PrivateRoute allowedRole="TEACHER" />}>
        <Route path="/teacher/baigiang/:id" element={<Baigiangpage />} />
        <Route path="/teacher/baikiemtra/:id" element={<Baikiemtra />} />
        <Route path="/teacher" element={<AppLayout />}>
          <Route index element={<Teacher />} />
          <Route path="quizzes" element={<QuizPage />} />
          <Route path="quiz-result" element={<QuizResultPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/:id" element={<DocumentsDetailPage />} />
          <Route path="stats" element={<AssignmentStatistics />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="flashcards/add" element={<AddFlashcards />} />
          <Route path="flashcards/:id" element={<FlashcardDetail />} />
          <Route path="quiz/:id" element={<QuizPage />} />
        </Route>
      </Route>

      {/* LEARNER ROUTES - Cập nhật để Sidebar sáng đèn */}
      <Route element={<PrivateRoute allowedRole="LEARNER" />}>
        <Route path="/learner" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Tài liệu & Học tập */}
          <Route path="documents" element={<DocumentsLearner />} />
          <Route path="bai-giang/:id" element={<BaiGiang />} />
          
          {/* Quizzes */}
          <Route path="quizzes" element={<QuizzesLearner />} />
          <Route path="hoc-quizz/:id" element={<HocQuiz />} />
          <Route path="baikiemtra/:id" element={<BaiKiemTra />} />
          <Route path="quiz" element={<Quiz />} />
          
          {/* Flashcards */}
          <Route path="flashcards" element={<FlashcardsLearner />} />
          <Route path="flashcard" element={<FlashCard />} />
          <Route path="hoc-flashcard/:id" element={<FlashcardDetailLearner />} />
          
          {/* Tiện ích */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="chat-ai" element={<ChatAI />} />
          
          {/* --- KHU VỰC SỬA LỖI SIDEBAR SỰ CỐ --- */}
          {/* 1. Khớp hoàn toàn với Sidebar (path: "/learner/suco") */}
          <Route path="suco" element={<SuCo />} /> 
          
          {/* 2. Khớp hoàn toàn với các nút Báo cáo lỗi (path: "/learner/su-co") */}
          <Route path="su-co" element={<SuCo />} />
          
          {/* 3. Khớp với alias bao-cao (nếu có) */}
          <Route path="bao-cao-su-co" element={<SuCo />} />
          
          {/* --- KHU VỰC SỬA LỖI SIDEBAR TIẾN ĐỘ --- */}
          <Route path="tiendo" element={<TienDo />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}