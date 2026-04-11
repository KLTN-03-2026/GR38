import React, { useState, useMemo } from "react";
import AccountDetail from "../../components/Modal/Admin/AccountDetail";
import AddAccountModal from "../../components/Modal/Admin/AddAccountModal";
import {
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([
    {
      id: "101",
      name: "Phan Mạnh Quỳnh",
      dob: "11/02/1998",
      email: "nguyenthanhbinh@gmail.com",
      gender: "Nam",
      role: "Giáo viên",
      status: "Đang xử lý",
      statusColor: "bg-yellow-400",
      phone: "0851225478",
      joinDate: "12/01/2026",
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
      phone: "0901234567",
      joinDate: "15/01/2026",
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
      phone: "0908889990",
      joinDate: "20/01/2026",
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
      phone: "0934555666",
      joinDate: "05/02/2026",
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
      phone: "0771231234",
      joinDate: "10/02/2026",
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
      phone: "0889000111",
      joinDate: "12/02/2026",
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
      phone: "0909090909",
      joinDate: "01/03/2026",
    },
  ]);

  // --- STATE QUẢN LÝ ---
  const [viewingAccount, setViewingAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Trạng thái");
  const [filterRole, setFilterRole] = useState("Chức vụ");
  const [filterGender, setFilterGender] = useState("Giới tính");

  // --- LOGIC TÍNH TOÁN ---
  const accountStats = [
    { label: "Tổng tài khoản", value: accounts.length.toString() },
    {
      label: "Tổng giáo viên",
      value: accounts.filter((a) => a.role === "Giáo viên").length.toString(),
    },
    {
      label: "Tổng học sinh",
      value: accounts.filter((a) => a.role === "Học sinh").length.toString(),
    },
    { label: "Tổng hoạt động", value: "5" },
  ];

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "Trạng thái" || acc.status === filterStatus;
      const matchRole = filterRole === "Chức vụ" || acc.role === filterRole;
      const matchGender =
        filterGender === "Giới tính" || acc.gender === filterGender;
      return matchSearch && matchStatus && matchRole && matchGender;
    });
  }, [accounts, searchQuery, filterStatus, filterRole, filterGender]);

  // --- XỬ LÝ SỰ KIỆN ---
  const handleAddAccount = (newAccountData) => {
    // Tạo cấu trúc dữ liệu mới khớp với danh sách hiện tại
    const newAccount = {
      ...newAccountData,
      id: (Math.floor(Math.random() * 900) + 100).toString(),
      gender: "Nam",
      joinDate: new Date().toLocaleDateString("vi-VN"),
      statusColor:
        newAccountData.status === "Đang hoạt động"
          ? "bg-green-500"
          : "bg-red-500",
    };

    setAccounts([newAccount, ...accounts]);
    Swal.fire("Thành công!", "Tài khoản mới đã được thêm.", "success");
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Tài khoản "${name}" sẽ bị xóa khỏi hệ thống!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F26739",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        setAccounts(accounts.filter((acc) => acc.id !== id));
        Swal.fire("Đã xóa!", "Tài khoản đã được xóa thành công.", "success");
      }
    });
  };

  const handleEdit = (account) => {
    Swal.fire({
      title: "Chỉnh sửa tài khoản",
      text: `Đang mở trình chỉnh sửa cho: ${account.name}`,
      icon: "info",
      confirmButtonColor: "#F26739",
    });
  };

  if (viewingAccount) {
    return (
      <AccountDetail
        account={viewingAccount}
        onBack={() => setViewingAccount(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col font-['Inter'] relative">
      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý tài khoản
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)} // Mở modal tại đây
            className="bg-[#F26739] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition-all"
          >
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-[#F26739] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
              Tìm
            </button>
            <select
              className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option>Trạng thái</option>
              <option>Đang hoạt động</option>
              <option>Đang xử lý</option>
              <option>Đã vô hiệu hóa</option>
            </select>
            <select
              className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option>Chức vụ</option>
              <option>Giáo viên</option>
              <option>Học sinh</option>
            </select>
            <select
              className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option>Giới tính</option>
              <option>Nam</option>
              <option>Nữ</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
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

        {/* Table */}
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
                    {" "}
                    Mã{" "}
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900">
                    {" "}
                    Tên tài khoản{" "}
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900">
                    {" "}
                    Ngày sinh{" "}
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900">
                    {" "}
                    Gmail{" "}
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900">
                    {" "}
                    Giới tính{" "}
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900 text-center">
                    {" "}
                    Vai trò{" "}
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900 text-center">
                    {" "}
                    Trạng thái{" "}
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-900 text-center">
                    {" "}
                    Thao tác{" "}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 text-sm text-slate-900 font-bold text-center">
                      {" "}
                      {acc.id}{" "}
                    </td>
                    <td className="p-4 text-sm text-slate-900 font-medium">
                      <button
                        onClick={() => setViewingAccount(acc)}
                        className="hover:text-[#F26739] transition-colors hover:underline text-left font-semibold"
                      >
                        {acc.name}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{acc.dob}</td>
                    <td className="p-4 text-sm text-slate-600">{acc.email}</td>
                    <td className="p-4 text-sm text-slate-600 text-center">
                      {" "}
                      {acc.gender}{" "}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-md text-[11px] font-bold text-white shadow-sm ${acc.role === "Giáo viên" ? "bg-[#1D72D6]" : "bg-[#6366f1]"}`}
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
                        <button
                          onClick={() => handleEdit(acc)}
                          className="p-1.5 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id, acc.name)}
                          className="p-1.5 border border-slate-200 rounded-md text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAccount}
      />
    </div>
  );
};

export default AccountManagement;
