import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import AccountDetail from "../../components/Modal/Admin/AccountDetail";
import AddAccountModal from "../../components/Modal/Admin/AddAccountModal";
import { Search, Edit2, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const API = "http://localhost:8000/api/v1";

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Trạng thái");
  const [filterRole, setFilterRole] = useState("Chức vụ");
  const [filterGender, setFilterGender] = useState("Giới tính");

  // Hàm lấy token và cấu hình Header
  const getAuthHeader = () => {
    const tokenData = localStorage.getItem("token");
    if (!tokenData) return {};
    try {
      const parsed = JSON.parse(tokenData);
      const token = parsed.access_token;
      return { headers: { Authorization: `Bearer ${token}` } };
    } catch (err) {
      console.error("Lỗi parse token:", err);
      return {};
    }
  };

  // --- API: LẤY DANH SÁCH TÀI KHOẢN ---
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/users`, getAuthHeader());
      if (response.data.success) {
        setAccounts(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
      Swal.fire("Lỗi!", "Không thể tải danh sách tài khoản.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // --- LOGIC TÍNH TOÁN THỐNG KÊ ---
  const accountStats = useMemo(
    () => [
      { label: "Tổng tài khoản", value: accounts.length.toString() },
      {
        label: "Tổng giáo viên",
        value: accounts
          .filter((a) => a.role === "TEACHER" || a.role === "Giáo viên")
          .length.toString(),
      },
      {
        label: "Tổng Người học",
        value: accounts
          .filter((a) => a.role === "LEARNER" || a.role === "Người học")
          .length.toString(),
      },
      {
        label: "Tổng hoạt động",
        value: accounts
          .filter((a) => a.status === "Đang hoạt động")
          .length.toString(),
      },
    ],
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        (acc.fullName || acc.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "Trạng thái" || acc.status === filterStatus;
      const matchRole = filterRole === "Chức vụ" || acc.role === filterRole;
      const matchGender =
        filterGender === "Giới tính" || acc.gender === filterGender;
      return matchSearch && matchStatus && matchRole && matchGender;
    });
  }, [accounts, searchQuery, filterStatus, filterRole, filterGender]);

  // --- API: THÊM TÀI KHOẢN ---
  const handleAddAccount = async (newAccountData) => {
    try {
      const response = await axios.post(
        `${API}/admin/users`,
        newAccountData,
        getAuthHeader(),
      );
      if (response.data.success) {
        fetchAccounts(); // Load lại danh sách
        setIsAddModalOpen(false);
        Swal.fire("Thành công!", "Tài khoản mới đã được thêm.", "success");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể thêm tài khoản mới.", "error");
    }
  };

  // --- API: XÓA TÀI KHOẢN ---
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API}/admin/users/${id}`, getAuthHeader());
          setAccounts(accounts.filter((acc) => (acc._id || acc.id) !== id));
          Swal.fire("Đã xóa!", "Tài khoản đã được xóa thành công.", "success");
        } catch (err) {
          Swal.fire("Lỗi!", "Xóa tài khoản thất bại.", "error");
        }
      }
    });
  };

  // --- API: CẬP NHẬT TÀI KHOẢN ---
  const handleUpdate = async (updatedData) => {
    try {
      const id = updatedData._id || updatedData.id;
      const response = await axios.put(
        `${API}/admin/users/${id}`,
        updatedData,
        getAuthHeader(),
      );
      if (response.data.success) {
        fetchAccounts();
        setViewingAccount(null);
        Swal.fire("Thành công!", "Tài khoản đã được cập nhật.", "success");
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật tài khoản thất bại.", "error");
    }
  };

  if (viewingAccount) {
    return (
      <AccountDetail
        account={viewingAccount}
        onBack={() => setViewingAccount(null)}
        onUpdate={handleUpdate}
        onDelete={(id) =>
          handleDelete(id, viewingAccount.fullName || viewingAccount.name)
        }
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
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#F26739] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition-all"
          >
            Thêm tài khoản
          </button>
        </div>

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
              <option value="TEACHER">Giáo viên</option>
              <option value="LEARNER">Người học</option>
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

        <div className="grid grid-cols-4 gap-4 mb-6">
          {accountStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
            >
              <p className="text-sm font-bold text-slate-900 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

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
                    Gmail
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
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => (
                    <tr
                      key={acc._id || acc.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-slate-900 font-bold text-center">
                        {(acc._id || acc.id).substring(0, 5)}
                      </td>
                      <td className="p-4 text-sm text-slate-900 font-medium">
                        <button
                          onClick={() => setViewingAccount(acc)}
                          className="hover:text-[#F26739] transition-colors hover:underline text-left font-semibold"
                        >
                          {acc.fullName || acc.name}
                        </button>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {acc.email}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-md text-[11px] font-bold text-white shadow-sm ${acc.role === "TEACHER" || acc.role === "Giáo viên" ? "bg-[#1D72D6]" : "bg-[#6366f1]"}`}
                        >
                          {acc.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase ${
                            acc.status === "Đang hoạt động"
                              ? "bg-green-500"
                              : acc.status === "Đã vô hiệu hóa"
                                ? "bg-red-500"
                                : "bg-yellow-400"
                          }`}
                        >
                          {acc.status || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setViewingAccount(acc)}
                            className="p-1.5 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(
                                acc._id || acc.id,
                                acc.fullName || acc.name,
                              )
                            }
                            className="p-1.5 border border-slate-200 rounded-md text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
