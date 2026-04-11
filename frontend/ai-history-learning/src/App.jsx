import React, { useState } from "react";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AccountManagement from "./pages/Admin/AccountManagement";
import ReportManagement from "./pages/Admin/ReportManagement";

function App() {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Cột bên phải */}
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

export default App;
