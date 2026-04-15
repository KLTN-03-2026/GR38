import TeacherSidebar from "./SidebarTeacher";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col ml-[240px] min-w-0">
        <Header />
        <main className="flex-1 p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}