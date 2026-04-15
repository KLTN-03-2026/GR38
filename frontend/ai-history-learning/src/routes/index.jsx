import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "../components/CommonLayout/MainLayout.jsx";

// Pages: Auth
import LoginPage from "../pages/Auth/LoginPage.jsx";
import RegisterPage from "../pages/Auth/RegisterPage.jsx";

// Pages: Learner
import LearnerDashboard from "../pages/Learner/Dashboard.jsx";
import Documents from "../pages/Learner/Documents.jsx";
import Flashcards from "../pages/Learner/Flashcards.jsx";
import Quizzes from "../pages/Learner/Quizzes.jsx";
import SuCo from "../pages/Learner/SuCo.jsx";
import ThongTinNguoiHoc from "../pages/Learner/ThongTinNguoiHoc/ThongTinNguoiHoc.jsx";
import Baikiemtra from "../pages/Learner/Baikiemtra/Baikiemtra.jsx";
import FlashcardDetail from "../pages/Learner/HocFlashCard/FlashcardDetail.jsx";
import BaiGiang from "../pages/Learner/BaiGiang/BaiGiang.jsx";

// --- IMPORT THÊM HOCQUIZZ TẠI ĐÂY ---
import HocQuizz from "../pages/Learner/HocQuizz/HocQuizz.jsx";

const AppRouter = () => {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* LEARNER ROUTES - Được bọc bởi MainLayout */}
      <Route 
        path="/dashboard" 
        element={<MainLayout role="learner"><LearnerDashboard /></MainLayout>} 
      />
      <Route 
        path="/documents" 
        element={<MainLayout role="learner"><Documents /></MainLayout>} 
      />
      <Route 
        path="/flashcards" 
        element={<MainLayout role="learner"><Flashcards /></MainLayout>} 
      />
      
      <Route 
        path="/flashcards/:id" 
        element={<MainLayout role="learner"><FlashcardDetail /></MainLayout>} 
      />
      
      <Route 
        path="/quiz" 
        element={<MainLayout role="learner"><Quizzes /></MainLayout>} 
      />

      {/* --- THÊM ROUTE CHO HOCQUIZZ Ở ĐÂY --- */}
      <Route 
        path="/hoc-quizz/:id" 
        element={<MainLayout role="learner"><HocQuizz /></MainLayout>} 
      />

      <Route 
        path="/reports" 
        element={<MainLayout role="learner"><SuCo /></MainLayout>} 
      />
      <Route 
        path="/profile" 
        element={<MainLayout role="learner"><ThongTinNguoiHoc /></MainLayout>} 
      />
      <Route 
        path="/baikiemtra/:id" 
        element={<MainLayout role="learner"><Baikiemtra /></MainLayout>} 
      />

      <Route 
        path="/bai-giang/:id" 
        element={<MainLayout role="learner"><BaiGiang /></MainLayout>} 
      />

      {/* REDIRECTS & FALLBACK */}
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;