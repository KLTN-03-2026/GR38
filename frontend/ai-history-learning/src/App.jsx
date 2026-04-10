import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AdminDashboard from "./components/AdminDashboard";
import AccountManagement from "./components/AccountManagement";
// 1. Nhớ tạo file ReportManagement.jsx và import vào đây
import ReportManagement from "./components/ReportManagement";

function App() {
  // Bạn có thể đổi mặc định thành "content" để xem ngay kết quả
  const [activeTab, setActiveTab] = useState("content");

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-['Inter']">
      {/* Sidebar cố định bên trái */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Vùng nội dung bên phải */}
      <div className="flex-1 flex flex-col ml-[240px]">
        <Header />

        <main className="mt-16 min-h-screen">
          {/* 2. Cập nhật logic render ở đây */}
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "accounts" && <AccountManagement />}
          {activeTab === "content" && <ReportManagement />}
        </main>
      </div>
    </div>
  );
}

export default App;
