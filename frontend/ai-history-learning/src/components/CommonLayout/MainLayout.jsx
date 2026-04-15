import React from "react";
import Sidebar from "./Sidebar"; 
import Header from "./Header";

const MainLayout = ({ children, role = "learner" }) => {
  const handleLogout = () => {
    console.log("User logged out");
    window.location.href = "/"; // Quay về trang login
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-['Inter']">
      {/* Sidebar - Fix cứng bên trái */}
      <Sidebar role={role} />
      
      {/* Nội dung bên phải */}
      <div className="flex-1 flex flex-col ml-[240px] min-w-0">
        <Header role={role} onLogout={handleLogout} />
        
        {/* Main Content: Render các trang con tại đây */}
        <main className="flex-1 mt-[64px] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;