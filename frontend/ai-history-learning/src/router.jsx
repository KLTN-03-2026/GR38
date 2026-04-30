import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layout
import Sidebar from "./components/Layout/Sidebar";
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
import QuizPage from "./pages/Teacher/Quizzes/QuizPage.jsx";
import QuizResultPage from "./pages/Teacher/Quizzes/QuizResultPage.jsx";
import DocumentsPage from "./pages/Teacher/Documents/DocumentsPage.jsx";
import DocumentsDetailPage from "./pages/Teacher/Documents/DocumentsDetailPage.jsx";
import AssignmentStatistics from "./pages/Teacher/Quizzes/AssignmentStatistics.jsx";
import ProfilePage from "./components/Profile/ProfilePage.jsx";
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

// ================= HELPER =================
const getUser  = () => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } };
const getToken = () => localStorage.getItem("token");

// ================= PRIVATE ROUTE =================
function PrivateRoute({ allowedRole }) {
  const token = getToken();
  const role  = (getUser().role || "").toUpperCase();
  if (!token) return <Navigate to="/" replace />;
  return role === (allowedRole || "").toUpperCase() ? <Outlet /> : <Navigate to="/" replace />;
}

// ================= PUBLIC ROUTE =================
function PublicRoute() {
  const token = getToken();
  const role  = (getUser().role || "").toUpperCase();
  if (!token) return <Outlet />;
  if (role === "ADMIN")   return <Navigate to="/admin"   replace />;
  if (role === "TEACHER") return <Navigate to="/teacher" replace />;
  if (role === "LEARNER") return <Navigate to="/learner" replace />;
  return <Outlet />;
}

// ================= SHARED LAYOUT =================
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

// ================= ROUTER =================
export default function AppRouter() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route element={<PublicRoute />}>
        <Route path="/"         element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ADMIN */}
      <Route element={<PrivateRoute allowedRole="ADMIN" />}>
        <Route path="/admin" element={<AppLayout />}>
          <Route index           element={<AdminDashboard />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="content"  element={<ReportManagement />} />
          <Route path="profile"  element={<ProfilePage />} />
        </Route>
      </Route>

      {/* TEACHER */}
      <Route element={<PrivateRoute allowedRole="TEACHER" />}>
        <Route path="/teacher/baigiang/:id"   element={<Baigiangpage />} />
        <Route path="/teacher/baikiemtra/:id" element={<Baikiemtra />} />
        <Route path="/teacher" element={<AppLayout />}>
          <Route index                  element={<Teacher />} />
          <Route path="quizzes"         element={<QuizPage />} />
          <Route path="quiz-result"     element={<QuizResultPage />} />
          <Route path="documents"       element={<DocumentsPage />} />
          <Route path="documents/:id"   element={<DocumentsDetailPage />} />
          <Route path="stats"           element={<AssignmentStatistics />} />
          <Route path="profile"         element={<ProfilePage />} />
          <Route path="flashcards"      element={<Flashcards />} />
          <Route path="flashcards/add"  element={<AddFlashcards />} />
          <Route path="flashcards/:id"  element={<FlashcardDetail />} />
          <Route path="quiz/:id"        element={<QuizPage />} />
        </Route>
      </Route>

      {/* LEARNER */}
      <Route element={<PrivateRoute allowedRole="LEARNER" />}>
        <Route path="/learner" element={<AppLayout/>}>
          <Route index                      element={<Dashboard />} />
          <Route path="documents"           element={<DocumentsLearner />} />
          <Route path="bai-giang/:id"       element={<BaiGiang />} />
          <Route path="baikiemtra/:id"      element={<BaiKiemTra />} />
          <Route path="flashcards"          element={<FlashcardsLearner />} />
          <Route path="quizzes"             element={<QuizzesLearner />} />
          <Route path="hoc-quizz/:id"       element={<HocQuiz />} />
          <Route path="profile"             element={<ProfilePage />} />
          <Route path="suco"                element={<SuCo />} />
          <Route path="chat-ai"             element={<ChatAI />} />
          <Route path="flashcard"           element={<FlashCard />} />
          <Route path="quiz"                element={<Quiz />} />
          <Route path="hoc-flashcard/:id"   element={<FlashcardDetailLearner />} />
          <Route path="tiendo"              element={<TienDo />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}