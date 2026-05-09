import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, ChevronsUpDown, Loader2, User, GraduationCap, History, X, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../lib/api";

const SuCo = () => {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [apiDataList, setApiDataList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [userRoleSelection, setUserRoleSelection] = useState("");

  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [formData, setFormData] = useState({
    nhomNoiDung: location.state?.reportTarget || "",
    doiTuongCuThe: location.state?.targetId || "",
    loaiBaoCao: "sai thông tin lịch sử",
    tieuDe: "",
    moTa: "",
  });

  useEffect(() => {
    if (location.state?.reportTarget) {
      setFormData(prev => ({
        ...prev,
        nhomNoiDung: location.state.reportTarget,
        doiTuongCuThe: location.state.targetId || prev.doiTuongCuThe
      }));
      
      if (location.state.reportTarget === "giáo viên") {
          setUserRoleSelection(location.state.role || "");
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!formData.nhomNoiDung || formData.nhomNoiDung === "giáo viên") {
      setApiDataList([]);
      return;
    }

    const fetchData = async () => {
      setIsLoadingList(true);
      try {
        let endpoint = "";
        switch (formData.nhomNoiDung) {
          case "tài liệu": endpoint = "/documents"; break;
          case "quizzes": endpoint = "/quizzes"; break; 
          case "flashcards": endpoint = "/flashcards"; break;
          default: break;
        }

        if (endpoint) {
          const res = await api.get(endpoint);
          
          // Logic kiểm tra dữ liệu linh hoạt cho từng loại API
          let dataPayload = [];
          const responseData = res.data;

          if (formData.nhomNoiDung === "quizzes") {
            // Đối với Quizzes, kiểm tra các trường phổ biến như .quizzes hoặc .data
            dataPayload = responseData.quizzes || responseData.data || responseData;
          } else {
            dataPayload = responseData.data || responseData;
          }
          
          // Nếu có phân trang kiểu .docs (Thường gặp ở thư viện mongoose-paginate)
          if (!Array.isArray(dataPayload) && dataPayload.docs) {
            dataPayload = dataPayload.docs;
          }

          // Cuối cùng đảm bảo là một mảng
          const finalData = Array.isArray(dataPayload) ? dataPayload : [];
          setApiDataList(finalData);
          
          console.log(`Dữ liệu tải cho ${formData.nhomNoiDung}:`, finalData);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setApiDataList([]);
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchData();
  }, [formData.nhomNoiDung]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    setShowHistory(true);
    try {
      const response = await api.get("/reports/my-reports");
      setHistoryData(response.data?.data || []);
    } catch (error) {
      Swal.fire("Lỗi", "Không thể tải lịch sử báo cáo", "error");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nhomNoiDung") {
      const originalTarget = location.state?.reportTarget;
      const originalId = location.state?.targetId;
      
      setFormData({ 
        ...formData, 
        [name]: value, 
        doiTuongCuThe: (value === originalTarget) ? (originalId || "") : "" 
      });
      setUserRoleSelection("");
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.nhomNoiDung) newErrors.nhomNoiDung = "Vui lòng chọn nhóm nội dung";
    
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    if (formData.nhomNoiDung === "giáo viên") {
      if (!userRoleSelection) newErrors.userRoleSelection = "Vui lòng chọn vai trò";
      if (!formData.doiTuongCuThe || !isValidObjectId(formData.doiTuongCuThe)) {
        Swal.fire({ icon: 'error', title: 'Thiếu đối tượng', text: 'Vui lòng báo cáo từ trang cá nhân của người dùng.' });
        return false;
      }
    } else if (formData.nhomNoiDung) {
      if (!formData.doiTuongCuThe || !isValidObjectId(formData.doiTuongCuThe)) {
        newErrors.doiTuongCuThe = "Vui lòng chọn một mục cụ thể";
        Swal.fire({ icon: 'warning', title: 'Chưa chọn đối tượng', text: 'Vui lòng chọn một mục cụ thể từ danh sách.' });
        return false;
      }
    }
    
    if (!formData.tieuDe.trim()) newErrors.tieuDe = "Vui lòng nhập tiêu đề báo cáo";
    if (!formData.moTa.trim()) newErrors.moTa = "Vui lòng nhập mô tả chi tiết";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      
      const targetTypeMap = { 
        "tài liệu": "Document", 
        "quizzes": "Quiz", 
        "flashcards": "Flashcard", 
        "giáo viên": "User" 
      };

      const issueTypeMapping = {
        "sai thông tin lịch sử": "historical_fact",
        "sai mốc thời gian": "timeline",
        "hành vi không chuẩn mực": "inappropriate_behavior",
        "spam": "spam",
        "lỗi tài liệu": "typo",
        "khác": "other"
      };

      const payload = {
        targetType: targetTypeMap[formData.nhomNoiDung],
        targetId: formData.doiTuongCuThe,
        issueType: issueTypeMapping[formData.loaiBaoCao] || "other",
        description: `[${formData.tieuDe.trim()}] ${formData.moTa.trim()}`
      };

      const response = await api.post("/reports", payload);

      if (response.data?.success) {
        Swal.fire({ icon: 'success', title: 'Thành công', text: response.data.message });
        setFormData({ nhomNoiDung: "", doiTuongCuThe: "", loaiBaoCao: "sai thông tin lịch sử", tieuDe: "", moTa: "" });
        setUserRoleSelection("");
        setErrors({});
        setApiDataList([]);
      }
    } catch (err) {
      console.error("Submit Error:", err.response?.data);
      Swal.fire({ 
        icon: 'error', 
        title: 'Lỗi gửi báo cáo', 
        text: err.response?.data?.message || "Không thể gửi báo cáo vào lúc này." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium"><Clock size={12}/> Đang chờ</span>;
      case "resolved": return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium"><CheckCircle2 size={12}/> Đã xử lý</span>;
      default: return <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="flex items-start justify-center pt-20 px-10 bg-[#FAFAFA] min-h-screen font-['Inter']">
      <div className="relative w-[840px] bg-white border border-[#E4E4E7] shadow-lg rounded-[10px] p-[24px] flex flex-col gap-[16px]">
        
        {showHistory && (
          <div className="absolute inset-0 z-50 bg-white rounded-[10px] p-[24px] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <History className="text-[#F26739]" size={24} />
                <h2 className="text-[20px] font-bold text-[#09090B]">Lịch sử báo cáo của tôi</h2>
              </div>
              <button onClick={() => setShowHistory(false)} className="px-4 py-2 text-sm font-semibold text-white bg-[#F26739] hover:bg-orange-600 rounded-md transition-colors flex items-center gap-2 shadow-sm">
                Trở về trang báo cáo <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-500">
                  <Loader2 className="animate-spin text-[#F26739]" size={32} />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : historyData.length > 0 ? (
                <div className="space-y-4">
                  {historyData.map((report) => (
                    <div key={report._id} className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">{report.targetType}</span>
                          {getStatusBadge(report.status)}
                        </div>
                        <span className="text-[11px] text-gray-400">{new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{report.targetId?.title || report.targetId?.fullName || report.targetId?.name || "Đối tượng không xác định"}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2 italic">"{report.description}"</p>
                      {report.adminNotes && (
                        <div className="mt-2 bg-blue-50 border-l-2 border-blue-400 p-2 rounded-r">
                           <p className="text-[11px] text-blue-700 flex items-center gap-1">
                            <MessageSquare size={10}/> <strong>Phản hồi:</strong> {report.adminNotes}
                           </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <AlertCircle size={40} className="opacity-20" />
                  <p>Bạn chưa gửi báo cáo nào.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h2 className="text-[24px] font-semibold text-[#09090B]">Gửi phản hồi & Báo cáo</h2>
          <p className="text-[14px] text-[#71717A]">Chúng tôi sẽ xử lý báo cáo của bạn trong vòng 24h.</p>
        </div>

        <div className="w-full h-[50px] bg-[#F4F4F5] rounded-[6px] flex items-center p-1">
          <div className="flex justify-center items-center gap-2 w-full h-full bg-white shadow-sm rounded-[4px]">
            <AlertCircle size={16} className="text-orange-500" />
            <span className="text-[14px] font-medium">Chi tiết báo cáo sự cố</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Phân loại nội dung</label>
            <div className="relative">
              <select name="nhomNoiDung" value={formData.nhomNoiDung} onChange={handleChange} className={`appearance-none w-full h-10 px-4 border rounded-md bg-white outline-none focus:border-[#F26739] transition-all ${errors.nhomNoiDung ? 'border-red-500 bg-red-50' : 'border-[#E4E4E7]'}`}>
                <option value="">-- Chọn mục báo cáo --</option>
                <option value="tài liệu">Tài liệu học tập</option>
                <option value="quizzes">Bài kiểm tra (Quiz)</option> 
                <option value="flashcards">Bộ thẻ ghi nhớ (Flashcards)</option>
                <option value="giáo viên">Người Học / Giáo viên</option>
              </select>
              <ChevronsUpDown size={14} className="absolute right-3 top-3 opacity-40 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Vấn đề gặp phải</label>
            <div className="relative">
              <select name="loaiBaoCao" value={formData.loaiBaoCao} onChange={handleChange} className="appearance-none w-full h-10 px-4 border border-[#E4E4E7] rounded-md bg-white outline-none focus:border-[#F26739]" >
                <option value="sai thông tin lịch sử">Sai thông tin lịch sử</option>
                <option value="sai mốc thời gian">Sai mốc thời gian</option>
                <option value="hành vi không chuẩn mực">Hành vi không chuẩn mực</option>
                <option value="spam">Nội dung rác (Spam)</option>
                <option value="lỗi tài liệu">Lỗi kỹ thuật / Hiển thị</option>
                <option value="khác">Khác</option>
              </select>
              <ChevronsUpDown size={14} className="absolute right-3 top-3 opacity-40 pointer-events-none" />
            </div>
          </div>
        </div>

        {formData.nhomNoiDung === "giáo viên" && (
          <div className="flex flex-col gap-1">
            <div className={`flex gap-4 p-2 bg-slate-50 rounded-lg border ${errors.userRoleSelection ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
              <button type="button" onClick={() => { setUserRoleSelection("learner"); setErrors(prev => ({...prev, userRoleSelection: ""})); }} className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-md transition-all text-sm font-semibold ${userRoleSelection === "learner" ? "bg-[#F26739] text-white shadow-md" : "bg-white text-slate-600 border"}`}>
                <User size={16} /> Người Học
              </button>
              <button type="button" onClick={() => { setUserRoleSelection("teacher"); setErrors(prev => ({...prev, userRoleSelection: ""})); }} className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-md transition-all text-sm font-semibold ${userRoleSelection === "teacher" ? "bg-[#F26739] text-white shadow-md" : "bg-white text-slate-600 border"}`}>
                <GraduationCap size={16} /> Giáo viên
              </button>
            </div>
          </div>
        )}

        {formData.nhomNoiDung && formData.nhomNoiDung !== "giáo viên" && (
          <div className={`flex flex-col gap-2 p-4 bg-orange-50/50 border rounded-lg ${errors.doiTuongCuThe ? 'border-red-500' : 'border-orange-100'}`}>
            <label className="text-xs font-semibold text-orange-700 uppercase">Danh sách {formData.nhomNoiDung}</label>
            {isLoadingList ? (
              <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin"/> Đang tải...</div>
            ) : apiDataList.length > 0 ? (
              <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
                {apiDataList.map((item) => (
                  <button key={item._id || item.id} type="button" onClick={() => { setFormData({ ...formData, doiTuongCuThe: item._id || item.id }); setErrors(prev => ({...prev, doiTuongCuThe: ""})); }} className={`px-4 py-2 text-xs font-medium rounded-full border whitespace-nowrap transition-all ${formData.doiTuongCuThe === (item._id || item.id) ? "bg-[#F26739] text-white" : "bg-white text-gray-700 hover:border-orange-300"}`}>
                    {item.title || item.fullName || item.name || "Không rõ tên"}
                  </button>
                ))}
              </div>
            ) : <div className="text-sm text-red-500 italic">Không tìm thấy dữ liệu {formData.nhomNoiDung}.</div>}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Tiêu đề báo cáo</label>
            <input name="tieuDe" value={formData.tieuDe} onChange={handleChange} placeholder="Nhập tiêu đề..." className={`w-full h-10 px-4 border rounded-md outline-none focus:border-orange-500 ${errors.tieuDe ? 'border-red-500' : 'border-[#E4E4E7]'}`} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Mô tả chi tiết</label>
            <textarea name="moTa" value={formData.moTa} onChange={handleChange} className={`w-full h-24 p-4 border rounded-md outline-none resize-none focus:border-orange-500 ${errors.moTa ? 'border-red-500' : 'border-[#E4E4E7]'}`} placeholder="Mô tả cụ thể..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={fetchHistory} className="flex items-center gap-2 px-6 h-10 text-sm font-semibold text-orange-600 bg-orange-50 rounded-md"> 
            <History size={16}/> Lịch sử
          </button>
          <button disabled={isSubmitting} onClick={handleSubmit} className="flex items-center justify-center min-w-[150px] h-10 bg-[#F26739] text-white rounded-md font-semibold disabled:bg-gray-300">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Gửi báo cáo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuCo;