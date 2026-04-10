import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const AccountManagement = () => {
  const accountStats = [
    { label: "Tổng tài khoản", value: "108" },
    { label: "Tổng giáo viên", value: "70" },
    { label: "Tổng học sinh", value: "2" },
    { label: "Tổng sự cố", value: "5" },
  ];

  const accounts = [
    {
      id: "101",
      name: "Phan Mạnh Quỳnh",
      dob: "18/10/1988",
      email: "nguyenthanhbinh789@gmail.com",
      gender: "Nam",
      role: "Giáo viên",
      status: "Đang xử lý",
      statusColor: "bg-yellow-400",
    },
    {
      id: "110",
      name: "Lâm Minh Phú",
      dob: "12/01/2004",
      email: "lehoanganh2302@gmail.com",
      gender: "Nữ",
      role: "Học sinh",
      status: "Đang hoạt động",
      statusColor: "bg-green-500",
    },
    {
      id: "220",
      name: "Lý Thành Ân",
      dob: "17/09/2004",
      email: "tranducminh.dev@gmail.com",
      gender: "Nữ",
      role: "Giáo viên",
      status: "Đang hoạt động",
      statusColor: "bg-green-500",
    },
    {
      id: "430",
      name: "Đinh Bảo Toàn",
      dob: "24/10/2004",
      email: "kimphuong97@gmail.com",
      gender: "Nam",
      role: "Học sinh",
      status: "Đang hoạt động",
      statusColor: "bg-green-500",
    },
    {
      id: "550",
      name: "Nguyễn Việt Dũng",
      dob: "19/12/2004",
      email: "hoanglong.it@gmail.com",
      gender: "Nam",
      role: "Học sinh",
      status: "Đang hoạt động",
      statusColor: "bg-green-500",
    },
    {
      id: "601",
      name: "Bùi Phú Hùng",
      dob: "16/03/2004",
      email: "phamthanhtruc99@gmail.com",
      gender: "Nữ",
      role: "Học sinh",
      status: "Đang hoạt động",
      statusColor: "bg-green-500",
    },
    {
      id: "602",
      name: "Nguyễn Tấn Hoàng",
      dob: "18/10/1985",
      email: "dangkhoa2004@gmail.com",
      gender: "Nam",
      role: "Học sinh",
      status: "Đã vô hiệu hóa",
      statusColor: "bg-red-500",
    },
  ];

  return (
    <div className="flex-1 flex flex-col font-['Inter']">
      <main className="p-8">
        {/* Header Title & Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý tài khoản
          </h1>
          <button className="bg-[#F26739] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition-all">
            Thêm tài khoản
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-4">
            Tìm kiếm và lọc
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Lọc theo tên, Gmail"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <button className="bg-[#F26739] text-white px-6 py-2 rounded-lg text-sm font-medium">
              Tìm
            </button>
            <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none">
              <option>Trạng thái</option>
            </select>
            <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none">
              <option>Chức vụ</option>
            </select>
            <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none">
              <option>Giới tính</option>
            </select>
          </div>
        </div>

        {/* Small Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {accountStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
            >
              <p className="text-sm font-bold text-slate-900 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-900">
              Danh sách tài khoản
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="p-4 text-sm font-bold text-slate-900 text-center">
                    Mã
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900">
                    Tên tài khoản
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900">
                    Ngày sinh
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900">
                    Gmail
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900">
                    Giới tính
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900 text-center">
                    Vai trò
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900 text-center">
                    Trạng thái
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900 text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 text-sm text-slate-900 font-bold text-center">
                      {acc.id}
                    </td>
                    <td className="p-4 text-sm text-slate-900 font-medium">
                      {acc.name}
                    </td>
                    <td className="p-4 text-sm text-slate-600">{acc.dob}</td>
                    <td className="p-4 text-sm text-slate-600">{acc.email}</td>
                    <td className="p-4 text-sm text-slate-600 text-center">
                      {acc.gender}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-md text-[11px] font-bold text-white shadow-sm ${acc.role === "Giáo viên" ? "bg-[#1D72D6]" : "bg-[#1D72D6]"}`}
                      >
                        {acc.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase ${acc.statusColor}`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100">
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1.5 border border-slate-200 rounded-md text-red-500 hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
            <span className="text-xs text-slate-500 font-medium">
              1 / 10 trang
            </span>
            <div className="flex items-center gap-2">
              <button className="flex items-center px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50">
                <ChevronLeft size={14} /> Previous
              </button>
              <button className="px-3 py-1.5 border border-slate-200 bg-white rounded-md text-xs font-medium text-[#F26739]">
                1
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-slate-600">
                2
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-slate-600">
                3
              </button>
              <span className="text-slate-400">...</span>
              <button className="flex items-center px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountManagement;
