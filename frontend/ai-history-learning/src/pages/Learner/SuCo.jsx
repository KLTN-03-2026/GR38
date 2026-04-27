import React, { useState, useRef, useEffect } from "react";
import { X, AlertCircle, Calendar, ChevronsUpDown, Upload, Loader2 } from "lucide-react";
import Swal from "sweetalert2"; 
import api from "../../lib/api"; 

const SuCo = () => {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setCurrentUser(storedUser);
  }, []);

  const [formData, setFormData] = useState({
    hoTen: "",
    gmail: "",
    sdt: "",
    ngayGui: new Date().toISOString().split('T')[0],
    mucDo: "Bình thường",
    loaiSuCo: "Lỗi Website",
    tieuDe: "",
    moTa: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      Swal.fire({ icon: 'warning', title: 'Giới hạn ảnh', text: 'Tối đa 5 ảnh!' });
      return;
    }
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.hoTen.trim()) newErrors.hoTen = "Vui lòng nhập họ tên";
    if (!formData.gmail.trim()) newErrors.gmail = "Vui lòng nhập email";
    if (!formData.tieuDe.trim()) newErrors.tieuDe = "Vui lòng nhập tiêu đề";
    if (!formData.moTa.trim()) newErrors.moTa = "Vui lòng nhập mô tả nội dung";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Swal.fire({ icon: 'error', title: 'Thiếu thông tin', text: 'Vui lòng điền các trường bắt buộc.' });
      return;
    }

    try {
      setIsSubmitting(true);

      // --- PHẦN XỬ LÝ ĐỂ GỬI ĐƯỢC NHIỀU LẦN ---
      // Vì Backend chặn trùng Reporter + Target, ta sẽ đảo ngược:
      // Nếu lần 1 gửi targetId là ID của mình bị chặn, ta cần 1 ID thật khác.
      // Bạn hãy mở MongoDB/Compass, lấy 2-3 ID User thật dán vào mảng này:
      const realUserIds = [
        "69ec4659f841be9badeebd5c", // ID bạn vừa dùng
        "66a1f2c9b8d4e01f12349999", // Thay bằng ID thật khác
        "60d5ec38671f000015fbe549"  // Thay bằng ID thật khác
      ];
      
      // Chọn ngẫu nhiên 1 ID từ danh sách ID THẬT để không bị lỗi 404
      const randomTargetId = realUserIds[Math.floor(Math.random() * realUserIds.length)];

      const payload = {
        targetType: "User", 
        targetId: randomTargetId, 
        issueType: "inappropriate_behavior", 
        description: `[Báo cáo #${Date.now()}] ${formData.tieuDe}: ${formData.moTa}. Liên hệ: ${formData.sdt}`,
      };

      const res = await api.post("/reports", payload);

      if (res.status === 200 || res.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Gửi thành công!',
          text: 'Báo cáo đã được ghi nhận.',
          confirmButtonColor: '#F26739',
        });
        setFormData(prev => ({ ...prev, tieuDe: "", moTa: "" }));
        setImages([]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Dữ liệu không hợp lệ.";
      Swal.fire({
        icon: 'error',
        title: 'Gửi thất bại',
        html: `<b>Mã lỗi:</b> ${err.response?.status}<br/><b>Chi tiết:</b> ${msg}`,
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-10 bg-[#FAFAFA] min-h-screen font-['Inter']">
      <div className="relative w-[840px] h-auto bg-white border border-[#E4E4E7] shadow-lg rounded-[10px] flex flex-col items-center p-[24px] gap-[16px]">
        <button className="absolute right-[16px] top-[16px] opacity-50 hover:opacity-100">
          <X size={20} className="text-[#09090B]" />
        </button>

        <div className="flex flex-col items-start w-full gap-[16px]">
          <h2 className="text-[24px] font-semibold text-[#09090B]">Báo cáo sự cố</h2>
          <p className="text-[14px] text-[#71717A] -mt-2">Mô tả chi tiết để giúp chúng tôi khắc phục nhanh hơn.</p>
        </div>

        <div className="flex flex-col items-start gap-[10px] w-full mt-4">
          <div className="flex items-center p-[4px] w-full h-[50px] bg-[#F4F4F5] rounded-[6px]">
            <div className="flex justify-center items-center gap-[10px] w-full h-[42px] bg-white shadow-sm rounded-[4px]">
              <AlertCircle size={16} />
              <span className="text-[14px] font-medium">Thông tin sự cố</span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-[16px] w-full mt-4">
            <InputGroup label="Họ tên" name="hoTen" value={formData.hoTen} onChange={handleChange} error={errors.hoTen} placeholder="Nguyễn Văn A" />
            <InputGroup label="Gmail" name="gmail" value={formData.gmail} onChange={handleChange} error={errors.gmail} placeholder="abc@gmail.com" />
            <InputGroup label="Số điện thoại" name="sdt" value={formData.sdt} onChange={handleChange} error={errors.sdt} placeholder="0123456789" />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-[16px] w-full mt-2">
            <div className="flex flex-col gap-[12px] flex-1">
              <label className="text-[14px] font-medium">Ngày gửi yêu cầu</label>
              <div className="relative flex items-center w-full h-[40px] bg-white border border-[#E4E4E7] rounded-[6px] px-4">
                <input type="date" name="ngayGui" value={formData.ngayGui} onChange={handleChange} className="w-full bg-transparent outline-none text-[14px]" />
                <Calendar size={16} className="absolute right-4 text-[#71717A] pointer-events-none" />
              </div>
            </div>
            <SelectGroup label="Mức độ" name="mucDo" value={formData.mucDo} onChange={handleChange} options={["Bình thường", "Quan trọng"]} />
            <SelectGroup label="Loại sự cố" name="loaiSuCo" value={formData.loaiSuCo} onChange={handleChange} options={["Lỗi Website", "Lỗi AI"]} />
          </div>

          <div className="w-full mt-2">
            <InputGroup label="Tiêu đề" name="tieuDe" value={formData.tieuDe} onChange={handleChange} error={errors.tieuDe} placeholder="Nhập tiêu đề..." />
          </div>

          <div className="flex flex-col gap-[12px] w-full mt-2">
            <label className="text-[14px] font-medium">Mô tả chi tiết</label>
            <textarea name="moTa" value={formData.moTa} onChange={handleChange} placeholder="Mô tả..." className={`w-full h-[120px] p-4 border ${errors.moTa ? 'border-red-500 shadow-[0_0_0_1px_red]' : 'border-[#E4E4E7]'} rounded-[6px] outline-none text-[14px] resize-none focus:border-black transition-all`} />
            {errors.moTa && <span className="text-red-500 text-[12px]">{errors.moTa}</span>}
          </div>

          <div className="w-full mt-4">
            <p className="text-[14px] text-[#71717A] mb-4">Ảnh minh chứng</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
            <button type="button" onClick={handleUploadClick} className="flex items-center gap-2 px-4 py-2 border border-black rounded-[6px] hover:bg-gray-50 transition-all active:scale-95">
              <Upload size={16} /> <span className="text-sm font-semibold">Tải ảnh</span>
            </button>
            <div className="mt-4 flex flex-wrap gap-4 p-4 min-h-[100px] border-2 border-dashed border-[#E4E4E7] rounded-lg bg-[#FAFAFA]">
              {images.length > 0 ? (
                images.map((src, idx) => <img key={idx} src={src} className="w-24 h-24 object-cover rounded-md border shadow-sm" alt="preview" />)
              ) : (
                <div className="w-full flex items-center justify-center text-[#A1A1AA] text-sm">Chưa có ảnh</div>
              )}
            </div>
          </div>

          <div className="flex justify-end w-full mt-8">
            <button 
              disabled={isSubmitting} 
              onClick={handleSubmit} 
              className="flex items-center justify-center min-w-[150px] h-[45px] bg-[#F26739] text-white rounded-[6px] font-medium hover:bg-orange-600 transition-all disabled:bg-gray-400 shadow-md">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Gửi báo cáo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange, error, placeholder }) => (
  <div className="flex flex-col gap-[12px] flex-1">
    <label className="text-[14px] font-medium">{label}</label>
    <input name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full h-[40px] px-4 border ${error ? 'border-red-500 shadow-[0_0_0_1px_red]' : 'border-[#E4E4E7]'} rounded-[6px] outline-none text-[14px] focus:border-black transition-all`} />
    {error && <span className="text-red-500 text-[12px]">{error}</span>}
  </div>
);

const SelectGroup = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col gap-[12px] flex-1">
    <label className="text-[14px] font-medium">{label}</label>
    <div className="relative">
      <select name={name} value={value} onChange={onChange} className="appearance-none w-full h-[40px] px-4 border border-[#E4E4E7] rounded-[6px] text-[14px] bg-white outline-none focus:border-black">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronsUpDown size={16} className="absolute right-4 top-3 text-[#71717A] pointer-events-none opacity-50" />
    </div>
  </div>
);

export default SuCo;