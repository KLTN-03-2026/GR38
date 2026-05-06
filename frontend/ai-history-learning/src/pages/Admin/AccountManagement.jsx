import React, { useState, useMemo, useEffect } from "react";
import api from "../../lib/api";
import AccountDetail from "../../components/Modal/Admin/AccountDetail";
import AddAccountModal from "../../components/Modal/Admin/AddAccountModal";
import {
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import Swal from "sweetalert2";

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const normalizeRole = (role) => (role || "").toString().toUpperCase();
  const getRoleLabel = (role) => {
    const normalized = normalizeRole(role);
    if (normalized === "TEACHER") return "Giáo viên";
    if (normalized === "LEARNER") return "Người học";
    return role || "";
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Trạng thái");
  const [filterRole, setFilterRole] = useState("Chức vụ");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      if (response.data.success) {
        // Loại bỏ Admin khỏi danh sách quản lý
        const filteredData = response.data.data.filter(
          (a) => normalizeRole(a.role) !== "ADMIN",
        );
        setAccounts(filteredData);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterRole]);

  // Logic nhận diện trạng thái
  const getStatusText = (acc) => {
    if (acc.isDisabledByAdmin) return "Đã vô hiệu hóa";
    if (acc.isActive) return "Đang hoạt động";
    return "Chờ xử lý";
  };

  const getStatusClass = (acc) => {
    const status = getStatusText(acc);
    if (status === "Đang hoạt động") return "bg-green-500";
    if (status === "Chờ xử lý") return "bg-amber-500";
    return "bg-red-500";
  };

  const accountStats = useMemo(
    () => [
      { label: "Tổng tài khoản", value: accounts.length.toString() },
      {
        label: "Chờ xử lý",
        value: accounts
          .filter((a) => !a.isActive && !a.isDisabledByAdmin)
          .length.toString(),
      },
      {
        label: "Đang hoạt động",
        value: accounts
          .filter((a) => a.isActive && !a.isDisabledByAdmin)
          .length.toString(),
      },
      {
        label: "Vô hiệu hóa",
        value: accounts.filter((a) => a.isDisabledByAdmin).length.toString(),
      },
    ],
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const name = acc.fullName || acc.name || "";
      const matchSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchQuery.toLowerCase());

      const currentStatusText = getStatusText(acc);
      const matchStatus =
        filterStatus === "Trạng thái" || currentStatusText === filterStatus;
      const matchRole =
        filterRole === "Chức vụ" ||
        normalizeRole(acc.role) === normalizeRole(filterRole);

      return matchSearch && matchStatus && matchRole;
    });
  }, [accounts, searchQuery, filterStatus, filterRole]);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(
      firstPageIndex,
      firstPageIndex + itemsPerPage,
    );
  }, [currentPage, filteredAccounts]);

  const handleUpdate = async (updatedData) => {
    try {
      const id = updatedData._id || updatedData.id;
      const normalizedRole = normalizeRole(updatedData.role);
      const payload = {
        ...updatedData,
        role: normalizedRole,
      };

      if (normalizedRole === "TEACHER") {
        if (updatedData.isActive && !updatedData.isDisabledByAdmin) {
          payload.teacherApprovalStatus = "approved";
        } else if (!updatedData.isActive && !updatedData.isDisabledByAdmin) {
          payload.teacherApprovalStatus = "pending";
        }
      }

      const response = await api.put(`/admin/users/${id}`, payload);
      if (response.data.success) {
        await fetchAccounts();
        setViewingAccount(null);
        Swal.fire(
          "Thành công!",
          "Thông tin tài khoản đã được cập nhật.",
          "success",
        );
      }
    } catch (err) {
      Swal.fire("Lỗi!", "Cập nhật thất bại.", "error");
    }
  };

  const handleCreateAccount = async (payload) => {
    try {
      setLoading(true);
      const response = await api.post("/admin/users", payload);
      if (response.data.success) {
        await fetchAccounts();
        Swal.fire("Thành công!", "Tạo tài khoản mới thành công.", "success");
      }
    } catch (err) {
      Swal.fire(
        "Lỗi!",
        err.response?.data?.error || "Không thể tạo tài khoản.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (acc) => {
    Swal.fire({
      title: "Phê duyệt tài khoản?",
      text: `Kích hoạt quyền hoạt động cho ${acc.fullName || acc.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: "Đồng ý duyệt",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdate({
          ...acc,
          isActive: true,
          isDisabledByAdmin: false,
          teacherApprovalStatus: "approved",
        });
      }
    });
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: `Tài khoản ${name} sẽ bị xóa vĩnh viễn.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F26739",
      confirmButtonText: "Xóa",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/users/${id}`);
          setAccounts(accounts.filter((acc) => (acc._id || acc.id) !== id));
          Swal.fire("Đã xóa!", "Thành công.", "success");
        } catch (err) {
          Swal.fire("Lỗi!", "Xóa thất bại.", "error");
        }
      }
    });
  };

  if (viewingAccount) {
    return (
      <AccountDetail
        account={viewingAccount}
        onBack={() => setViewingAccount(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col font-['Inter']">
      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý tài khoản
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#F26739] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 flex items-center gap-2"
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
                placeholder="Tìm tên hoặc email..."
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
              <option>Chờ xử lý</option>
              <option>Đang hoạt động</option>
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
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {accountStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
            >
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "..." : stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
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
                {!loading &&
                  currentTableData.map((acc) => (
                    <tr
                      key={acc._id || acc.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-slate-400 text-center">
                        {(acc._id || acc.id).substring(0, 5)}
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-900">
                        <button
                          onClick={() => setViewingAccount(acc)}
                          className="hover:text-[#F26739] hover:underline"
                        >
                          {acc.fullName || acc.name}
                        </button>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {acc.email}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-md text-[10px] font-bold text-white ${normalizeRole(acc.role) === "TEACHER" ? "bg-blue-600" : "bg-indigo-500"}`}
                        >
                          {getRoleLabel(acc.role)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase ${
                            getStatusText(acc) === "Đang hoạt động"
                              ? "bg-green-500"
                              : getStatusText(acc) === "Chờ xử lý"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        >
                          {getStatusText(acc)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          {getStatusText(acc) === "Chờ xử lý" && (
                            <button
                              onClick={() => handleApprove(acc)}
                              className="p-1.5 border border-green-200 rounded-md text-green-600 hover:bg-green-50"
                              title="Phê duyệt"
                            >
                              <UserCheck size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => setViewingAccount(acc)}
                            className="p-1.5 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100"
                            title="Chỉnh sửa"
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
                            title="Xóa"
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

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <p className="text-sm text-slate-500">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 border border-slate-200 rounded-md bg-white disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 border border-slate-200 rounded-md bg-white disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleCreateAccount}
      />
    </div>
  );
};

export default AccountManagement;
