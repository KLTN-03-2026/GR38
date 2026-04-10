import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AdminDashboard from "./components/AdminDashboard";
import AccountManagement from "./components/AccountManagement";
import ReportManagement from "./components/ReportManagement";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

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
