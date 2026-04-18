import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layout
import Sidebar from "./components/Layout/Sidebar";
import TeacherSidebar from "./components/Layout/SidebarTeacher";
import SidebarLearner from "./components/Layout/SidebarLeaner.jsx";
import Header from "./components/Layout/Header";

// Auth
import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";

// Admin
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AccountManagement from "./pages/Admin/AccountManagement";
import ReportManagement from "./pages/Admin/ReportManagement";

// Teacher
import Teacher from "./pages/Admin/Teacher.jsx";
import QuizPage from "./pages/Quizzes/QuizPage";
import QuizResultPage from "./pages/Quizzes/QuizResultPage";
import DocumentsPage from "./pages/Documents/DocumentsPage";
import DocumentsDetailPage from "./pages/Documents/DocumentsDetailPage";
import AssignmentStatistics from "./pages/Quizzes/AssignmentStatistics";
import ProfilePage from "./pages/Profile/ProfilePage";

// ⭐ Bài giảng & Bài kiểm tra (fullscreen — nằm NGOÀI layout)
import Baigiangpage from "./pages/Documents/Baigiangpage.jsx";
import Baikiemtra from "./pages/Documents/Baikiemtra.jsx";

// ⭐ FLASHCARD (TEACHER)
import Flashcards from "./pages/Quizzes/TeacherFlashcard.jsx";
import AddFlashcards from "./pages/Quizzes/AddFlashcards";
import FlashcardDetail from "./pages/Quizzes/FlashcardDetail";

// Learner
import Dashboard from "./pages/Learner/Dashboard";
import BaiGiang from "./pages/Learner/BaiGiang/BaiGiang";
import ChatAI from "./pages/Learner/BaiGiang/ChatAI";
import FlashCard from "./pages/Learner/BaiGiang/FlashCard";
import Quiz from "./pages/Learner/BaiGiang/Quizz.jsx";
import BaiKiemTra from "./pages/Learner/Baikiemtra/Baikiemtra";
import FlashcardDetailLearner from "./pages/Learner/HocFlashCard/FlashcardDetail";
import HocQuiz from "./pages/Learner/HocQuizz/HocQuizz.jsx";
import ThongTinNguoiHoc from "./pages/Learner/ThongTinNguoiHoc/ThongTinNguoiHoc";
import DocumentsLearner from "./pages/Learner/Documents";
import FlashcardsLearner from "./pages/Learner/Flashcards.jsx";
import QuizzesLearner from "./pages/Learner/Quizzes";
import SuCo from "./pages/Learner/SuCo";

// ================= PRIVATE ROUTE =================
function PrivateRoute({ allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const role = (user.role || "").toLowerCase();
  const allow = (allowedRole || "").toLowerCase();

  if (!role) return <Navigate to="/" replace />;

  return role === allow ? <Outlet /> : <Navigate to="/" replace />;
}

// ================= LAYOUTS =================
function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[240px]">
        <Header />
        <main className="flex-1 p-8 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col ml-[240px]">
        <Header />
        <main className="flex-1 p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function LearnerLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarLearner />
      <div className="flex-1 flex flex-col ml-[240px]">
        <Header />
        <main className="flex-1 p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ================= ROUTER =================
export default function AppRouter() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ================= ADMIN ================= */}
      <Route element={<PrivateRoute allowedRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="content" element={<ReportManagement />} />
        </Route>
      </Route>

      {/* ================= TEACHER ================= */}
      <Route element={<PrivateRoute allowedRole="teacher" />}>

        {/* ✅ Bài giảng & Bài kiểm tra — FULLSCREEN, không có TeacherLayout */}
        <Route path="/teacher/baigiang/:id" element={<Baigiangpage />} />
        <Route path="/teacher/baikiemtra/:id" element={<Baikiemtra />} />

        {/* Các trang còn lại vẫn dùng TeacherLayout (sidebar + header) */}
        <Route path="/teacher" element={<TeacherLayout />}>
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
        </Route>

      </Route>

      {/* ================= LEARNER ================= */}
      <Route element={<PrivateRoute allowedRole="learner" />}>
        <Route path="/learner" element={<LearnerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<DocumentsLearner />} />
          <Route path="bai-giang/:id" element={<BaiGiang />} />
          <Route path="baikiemtra/:id" element={<BaiKiemTra />} />
          <Route path="flashcards" element={<FlashcardsLearner />} />
          <Route path="quizzes" element={<QuizzesLearner />} />
          <Route path="hoc-quizz/:id" element={<HocQuiz />} />
          <Route path="profile" element={<ThongTinNguoiHoc />} />
          <Route path="suco" element={<SuCo />} />
          <Route path="chat-ai" element={<ChatAI />} />
          <Route path="flashcard" element={<FlashCard />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="hoc-flashcard" element={<FlashcardDetailLearner />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}