import React, { useState, useRef, useEffect } from "react";
import { X, AlertCircle, ChevronsUpDown, Upload, Loader2, Check, User, GraduationCap } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../lib/api";

const SuCo = () => {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [apiDataList, setApiDataList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [userRoleSelection, setUserRoleSelection] = useState(""); 

  const [formData, setFormData] = useState({
    nhomNoiDung: "", 
    doiTuongCuThe: "", 
    loaiBaoCao: "sai thông tin lịch sử",
    tieuDe: "",
    moTa: "",
  });

  // 1. Fetch dữ liệu Content (Tài liệu, Quizz, Flashcards)
  useEffect(() => {
    setApiDataList([]);
    setFormData(prev => ({ ...prev, doiTuongCuThe: "" }));
    setUserRoleSelection(""); 
    setErrors(prev => ({ ...prev, doiTuongCuThe: "" })); // Xóa lỗi khi đổi nhóm

    if (!formData.nhomNoiDung || formData.nhomNoiDung === "khác" || formData.nhomNoiDung === "giáo viên") return;

    const fetchData = async () => {
      setIsLoadingList(true);
      try {
        let endpoint = "";
        switch (formData.nhomNoiDung) {
          case "tài liệu": endpoint = "/documents"; break;
          case "quizz": endpoint = "/quizzes"; break; 
          case "flashcards": endpoint = "/flashcards"; break;
          default: break;
        }

        if (endpoint) {
          const res = await api.get(endpoint);
          // Kiểm tra mọi cấu trúc có thể có từ Backend
          const data = res.data?.quizzes || res.data?.data || (Array.isArray(res.data) ? res.data : []);
          setApiDataList(data);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách nội dung:", err);
        setApiDataList([]);
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchData();
  }, [formData.nhomNoiDung]);

  // 2. Fetch dữ liệu User/Teacher
  useEffect(() => {
    if (formData.nhomNoiDung === "giáo viên" && userRoleSelection) {
      setApiDataList([]); // Reset list trước khi load mới
      setErrors(prev => ({ ...prev, doiTuongCuThe: "" }));
      
      const fetchUsers = async () => {
        setIsLoadingList(true);
        try {
          const endpoint = userRoleSelection === "teacher" ? "/users/teachers" : "/users/learners";
          const res = await api.get(endpoint);
          const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
          setApiDataList(data);
        } catch (err) {
          console.error("Lỗi tải danh sách người dùng:", err);
          setApiDataList([]);
        } finally {
          setIsLoadingList(false);
        }
      };
      fetchUsers();
    }
  }, [userRoleSelection, formData.nhomNoiDung]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      Swal.fire({ icon: 'warning', title: 'Giới hạn ảnh', text: 'Tối đa 5 ảnh!' });
      return;
    }
    setImages([...images, ...files.map(file => URL.createObjectURL(file))]);
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.nhomNoiDung) newErrors.nhomNoiDung = "Chọn nhóm nội dung";
    if (formData.nhomNoiDung !== "khác" && !formData.doiTuongCuThe) newErrors.doiTuongCuThe = "Vui lòng chọn mục cụ thể";
    if (!formData.tieuDe.trim()) newErrors.tieuDe = "Vui lòng nhập tiêu đề";
    if (!formData.moTa.trim()) newErrors.moTa = "Vui lòng nhập mô tả";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Swal.fire({ icon: 'error', title: 'Thiếu thông tin', text: 'Vui lòng kiểm tra lại các trường đỏ.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        targetType: formData.nhomNoiDung === "giáo viên" ? "User" : "Content",
        targetId: formData.doiTuongCuThe,
        issueType: formData.loaiBaoCao,
        description: `[${formData.loaiBaoCao.toUpperCase()}] ${formData.tieuDe}: ${formData.moTa}`,
      };
      await api.post("/reports", payload);
      Swal.fire({ icon: 'success', title: 'Thành công', text: 'Báo cáo đã được gửi đi.' });
      setFormData({ nhomNoiDung: "", doiTuongCuThe: "", loaiBaoCao: "sai thông tin lịch sử", tieuDe: "", moTa: "" });
      setImages([]);
      setUserRoleSelection("");
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || "Không thể gửi báo cáo" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-10 bg-[#FAFAFA] min-h-screen font-['Inter']">
      <div className="relative w-[840px] bg-white border border-[#E4E4E7] shadow-lg rounded-[10px] p-[24px] flex flex-col gap-[16px]">
        
        <div className="flex flex-col gap-1">
          <h2 className="text-[24px] font-semibold text-[#09090B]">Gửi phản hồi & Báo cáo</h2>
          <p className="text-[14px] text-[#71717A]">Chúng tôi sẽ xử lý báo cáo của bạn trong vòng 24h.</p>
        </div>

        <div className="w-full h-[50px] bg-[#F4F4F5] rounded-[6px] flex items-center p-1">
          <div className="flex justify-center items-center gap-2 w-full h-full bg-white shadow-sm rounded-[4px]">
            <AlertCircle size={16} />
            <span className="text-[14px] font-medium">Chi tiết báo cáo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Phân loại nội dung</label>
            <div className="relative">
              <select 
                name="nhomNoiDung" 
                value={formData.nhomNoiDung} 
                onChange={handleChange}
                className={`appearance-none w-full h-10 px-4 border rounded-md bg-white outline-none focus:border-[#F26739] transition-all ${errors.nhomNoiDung ? 'border-red-500' : 'border-[#E4E4E7]'}`}
              >
                <option value="">-- Chọn mục báo cáo --</option>
                <option value="tài liệu">Tài liệu học tập</option>
                <option value="quizz">Bài kiểm tra (Quiz)</option>
                <option value="flashcards">Bộ thẻ ghi nhớ (Flashcards)</option>
                <option value="giáo viên">Người dùng / Giáo viên</option>
                <option value="khác">Vấn đề khác</option>
              </select>
              <ChevronsUpDown size={14} className="absolute right-3 top-3 opacity-40 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Vấn đề gặp phải</label>
            <div className="relative">
              <select 
                name="loaiBaoCao" 
                value={formData.loaiBaoCao} 
                onChange={handleChange}
                className="appearance-none w-full h-10 px-4 border border-[#E4E4E7] rounded-md bg-white outline-none focus:border-[#F26739]"
              >
                <option value="sai thông tin lịch sử">Sai thông tin lịch sử</option>
                <option value="sai mốc thời gian">Sai mốc thời gian</option>
                <option value="hành vi không chuẩn mực">Hành vi không chuẩn mực</option>
                <option value="spam">Nội dung rác (Spam)</option>
                <option value="lỗi tài liệu">Tài liệu không hiển thị</option>
                <option value="khác">Khác</option>
              </select>
              <ChevronsUpDown size={14} className="absolute right-3 top-3 opacity-40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* PHẦN CHỌN NGƯỜI DÙNG / GIÁO VIÊN */}
        {formData.nhomNoiDung === "giáo viên" && (
          <div className="flex gap-4 p-2 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => { setUserRoleSelection("learner"); setFormData(prev => ({ ...prev, doiTuongCuThe: "" })); }}
              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-md transition-all font-semibold ${userRoleSelection === "learner" ? "bg-[#F26739] text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
            >
              <User size={18} /> Người dùng
            </button>
            <button
              type="button"
              onClick={() => { setUserRoleSelection("teacher"); setFormData(prev => ({ ...prev, doiTuongCuThe: "" })); }}
              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-md transition-all font-semibold ${userRoleSelection === "teacher" ? "bg-[#F26739] text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
            >
              <GraduationCap size={18} /> Giáo viên
            </button>
          </div>
        )}

        {/* HIỂN THỊ DANH SÁCH BUTTONS CỤ THỂ */}
        {((formData.nhomNoiDung && formData.nhomNoiDung !== "khác" && formData.nhomNoiDung !== "giáo viên") || (formData.nhomNoiDung === "giáo viên" && userRoleSelection)) && (
          <div className="flex flex-col gap-3 p-4 bg-orange-50/50 border border-orange-100 rounded-lg">
            <label className="text-xs font-bold uppercase text-orange-600 tracking-wider">
              Chọn {userRoleSelection === "learner" ? "Người dùng" : userRoleSelection === "teacher" ? "Giáo viên" : formData.nhomNoiDung} cụ thể:
            </label>
            
            {isLoadingList ? (
              <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin"/> Đang tải...</div>
            ) : (
              apiDataList.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-1">
                  {apiDataList.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, doiTuongCuThe: item._id });
                        setErrors(prev => ({ ...prev, doiTuongCuThe: "" }));
                      }}
                      className={`px-3 py-2 text-xs font-medium rounded-full border transition-all flex items-center gap-1 ${
                        formData.doiTuongCuThe === item._id 
                        ? "bg-[#F26739] text-white border-[#F26739] shadow-md" 
                        : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      {formData.doiTuongCuThe === item._id && <Check size={12} />}
                      {item.title || item.fullName || item.name || item.username || "Không rõ tên"}
                    </button>
                  ))}
                </div>
              ) : (
                // Chỉ hiển thị "Không tìm thấy" nếu không phải đang trong quá trình chuyển đổi tab userRole
                !isLoadingList && <span className="text-xs text-gray-400 italic">Hiện tại chưa có dữ liệu hiển thị.</span>
              )
            )}
            {errors.doiTuongCuThe && <span className="text-red-500 text-[11px] font-medium">{errors.doiTuongCuThe}</span>}
          </div>
        )}

        {/* PHẦN NHẬP NỘI DUNG */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tiêu đề ngắn gọn</label>
            <input 
              name="tieuDe" 
              value={formData.tieuDe} 
              onChange={handleChange} 
              placeholder="VD: Sai năm diễn ra chiến dịch Điện Biên Phủ"
              className={`w-full h-10 px-4 border rounded-md outline-none focus:border-black transition-all ${errors.tieuDe ? 'border-red-500' : 'border-[#E4E4E7]'}`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Mô tả chi tiết nội dung lỗi</label>
            <textarea 
              name="moTa" 
              value={formData.moTa} 
              onChange={handleChange} 
              className={`w-full h-24 p-4 border rounded-md outline-none resize-none focus:border-black transition-all ${errors.moTa ? 'border-red-500' : 'border-[#E4E4E7]'}`}
              placeholder="Vui lòng mô tả chi tiết lỗi bạn gặp phải..."
            />
          </div>
        </div>

        {/* PHẦN ÚP ẢNH - GIỮ NGUYÊN GIAO DIỆN */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Ảnh minh chứng (tối đa 5)</span>
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm font-semibold transition-all"
            >
              <Upload size={14} /> Tải ảnh lên
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
          </div>
          <div className="flex flex-wrap gap-3 p-3 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50 min-h-[80px]">
            {images.length > 0 ? images.map((src, idx) => (
              <img key={idx} src={src} className="w-16 h-16 object-cover rounded border bg-white shadow-sm" alt="preview" />
            )) : <span className="w-full text-center text-xs text-gray-400 my-auto">Chưa có ảnh được chọn</span>}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button 
            type="button" 
            onClick={() => { setFormData({ nhomNoiDung: "", doiTuongCuThe: "", loaiBaoCao: "sai thông tin lịch sử", tieuDe: "", moTa: "" }); setImages([]); setUserRoleSelection(""); }}
            className="px-6 h-10 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            disabled={isSubmitting} 
            onClick={handleSubmit}
            className="flex items-center justify-center min-w-[140px] h-10 bg-[#F26739] text-white rounded-md font-semibold hover:bg-orange-600 shadow-md transition-all active:scale-95 disabled:bg-gray-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Gửi báo cáo ngay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuCo;