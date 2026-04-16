import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Auth
import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";

// Layout
import Sidebar from "./components/Layout/Sidebar";
import TeacherSidebar from "./components/Layout/SidebarTeacher";
import SidebarLearner from "./components/Layout/SidebarLeaner.jsx"; 
import Header from "./components/Layout/Header";

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

// LEARNER
import Dashboard from "./pages/Learner/Dashboard";
import BaiGiang from "./pages/Learner/BaiGiang/BaiGiang";
import ChatAI from "./pages/Learner/BaiGiang/ChatAI";
import FlashCard from "./pages/Learner/BaiGiang/FlashCard";
import Quiz from "./pages/Learner/BaiGiang/Quizz.jsx";
import BaiKiemTra from "./pages/Learner/Baikiemtra/Baikiemtra";
import FlashcardDetail from "./pages/Learner/HocFlashCard/FlashcardDetail";
import HocQuiz from "./pages/Learner/HocQuizz/HocQuizz.jsx";
import ThongTinNguoiHoc from "./pages/Learner/ThongTinNguoiHoc/ThongTinNguoiHoc";
import DocumentsLearner from "./pages/Learner/Documents";
import FlashcardsLearner from "./pages/Learner/Flashcards";
import QuizzesLearner from "./pages/Learner/Quizzes";
import SuCo from "./pages/Learner/SuCo";

// PRIVATE ROUTE 
function PrivateRoute({ allowedRole }) {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const currentRole = (user?.role || localStorage.getItem("role") || "").toLowerCase();
  
  return currentRole === allowedRole.toLowerCase() ? <Outlet /> : <Navigate to="/" replace />;
}

// Layout Components
function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[240px] min-w-0">
        <Header />
        <main className="flex-1 p-8 mt-16"><Outlet /></main>
      </div>
    </div>
  );
}

function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col ml-[240px] min-w-0">
        <Header />
        <main className="flex-1 p-6 mt-16"><Outlet /></main>
      </div>
    </div>
  );
}

function LearnerLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans">
      <SidebarLearner /> 
      <div className="flex-1 flex flex-col ml-[240px] min-w-0">
        <Header />
        <main className="flex-1 p-6 mt-16"><Outlet /></main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* --- ADMIN --- */}
      <Route element={<PrivateRoute allowedRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="content" element={<ReportManagement />} />
        </Route>
      </Route>

      {/* --- GIÁO VIÊN --- */}
      <Route element={<PrivateRoute allowedRole="teacher" />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Teacher />} />
          <Route path="quizzes" element={<QuizPage />} />
          <Route path="quiz-result" element={<QuizResultPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/:id" element={<DocumentsDetailPage />} />
          <Route path="stats" element={<AssignmentStatistics />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* --- LEARNER --- */}
      <Route element={<PrivateRoute allowedRole="learner" />}>
        <Route path="/learner" element={<LearnerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<DocumentsLearner />} />
          
          <Route path="bai-giang/:id" element={<BaiGiang />} />
          <Route path="baikiemtra/:id" element={<BaiKiemTra />} />
          
          <Route path="flashcards" element={<FlashcardsLearner />} />
          <Route path="quizzes" element={<QuizzesLearner />} />
          
          {/* SỬA LỖI TẠI ĐÂY: Thêm :id và sửa tên route khớp với Quizzes.jsx */}
          <Route path="hoc-quizz/:id" element={<HocQuiz />} />
          
          <Route path="profile" element={<ThongTinNguoiHoc />} />
          <Route path="suco" element={<SuCo />} />
          
          {/* Các route phụ */}
          <Route path="chat-ai" element={<ChatAI />} />
          <Route path="flashcard" element={<FlashCard />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="hoc-flashcard" element={<FlashcardDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;