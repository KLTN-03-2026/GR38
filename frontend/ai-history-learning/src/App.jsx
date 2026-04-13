import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AccountManagement from "./pages/Admin/AccountManagement";
import ReportManagement from "./pages/Admin/ReportManagement";

function AdminLayout() {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col ml-[240px] min-w-0">
        <Header />
        <main className="flex-1 p-8">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "accounts" && <AccountManagement />}
          {activeTab === "content" && <ReportManagement />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminLayout />} />
    </Routes>
  );
}

export default App;