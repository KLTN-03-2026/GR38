import React, { useState, useRef } from "react";
import { X, AlertCircle, Calendar, ChevronsUpDown, Upload } from "lucide-react";

const SuCo = () => {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    hoTen: "",
    gmail: "",
    sdt: "",
    ngayGui: "",
    mucDo: "Bình thường",
    loaiSuCo: "Lỗi Website",
    tieuDe: "",
    moTa: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Xóa lỗi ngay khi người dùng bắt đầu sửa lại trường đó
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert("Chỉ được tải lên tối đa 5 ảnh");
      return;
    }
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  // --- HÀM KIỂM TRA LỖI CHI TIẾT ---
  const validate = () => {
    let newErrors = {};
    const emailFormatRegex = /^[^\s@]+@gmail\.com$/;
    const containsCharRegex = /\D/; // Kiểm tra nếu có chứa ký tự không phải số

    // 1. Kiểm tra Họ tên
    if (!formData.hoTen.trim()) {
      newErrors.hoTen = "Vui lòng nhập họ tên";
    }

    // 2. Kiểm tra Gmail (2 trường hợp cụ thể)
    if (!formData.gmail.trim()) {
      newErrors.gmail = "Vui lòng nhập email";
    } else if (!emailFormatRegex.test(formData.gmail)) {
      newErrors.gmail = "Email không đúng định dạng (phải có @gmail.com)";
    }

    // 3. Kiểm tra Số điện thoại (2 trường hợp cụ thể)
    if (!formData.sdt.trim()) {
      newErrors.sdt = "Vui lòng nhập số điện thoại";
    } else if (containsCharRegex.test(formData.sdt)) {
      newErrors.sdt = "SĐT không hợp lệ (vui lòng nhập số, không nhập chữ)";
    } else if (formData.sdt.length < 10 || formData.sdt.length > 11) {
      newErrors.sdt = "Số điện thoại phải từ 10-11 số";
    }

    // 4. Các trường còn lại
    if (!formData.ngayGui) newErrors.ngayGui = "Vui lòng chọn ngày";
    if (!formData.tieuDe.trim()) newErrors.tieuDe = "Vui lòng nhập tiêu đề";
    if (!formData.moTa.trim()) newErrors.moTa = "Vui lòng nhập mô tả nội dung";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      alert("Gửi báo cáo sự cố thành công!");
      console.log("Dữ liệu báo cáo:", formData);
    }
  };

  return (
    <div className="flex items-center justify-center p-10 bg-[#FAFAFA] min-h-screen font-['Inter']">
      <div className="relative w-[840px] h-auto min-h-[1015px] bg-white border-l border-[#E4E4E7] shadow-lg rounded-[10px] flex flex-col items-center p-[24px] gap-[16px]">
        
        {/* Nút Close */}
        <button className="absolute right-[8px] top-[8px] w-[32px] h-[32px] flex items-center justify-center opacity-70 hover:opacity-100">
          <X size={16} className="text-[#09090B]" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-start w-[792px] gap-[16px] self-stretch">
          <h2 className="text-[24px] font-semibold text-[#09090B]">Báo cáo sự cố</h2>
          <p className="text-[14px] text-[#71717A] -mt-2">Vui lòng cung cấp thông tin chi tiết về sự cố bạn đang gặp phải.</p>
        </div>

        <div className="flex flex-col items-start gap-[10px] w-[792px] self-stretch">
          
          {/* Banner Thông tin */}
          <div className="flex items-center p-[4px] w-full h-[50px] bg-[#F4F4F5] rounded-[6px]">
            <div className="flex justify-center items-center gap-[10px] w-full h-[42px] bg-white shadow-sm rounded-[4px]">
              <AlertCircle size={16} className="text-[#09090B]" />
              <span className="text-[14px] font-medium text-[#09090B]">Thông tin sự cố</span>
            </div>
          </div>

          {/* Row 1: Họ tên, Gmail, SĐT */}
          <div className="flex flex-row gap-[16px] w-full mt-4 items-start">
            <InputGroup label="Họ tên" name="hoTen" value={formData.hoTen} onChange={handleChange} error={errors.hoTen} placeholder="Nguyễn Văn A" />
            <InputGroup label="Gmail" name="gmail" value={formData.gmail} onChange={handleChange} error={errors.gmail} placeholder="abc@gmail.com" />
            <InputGroup label="Số điện thoại" name="sdt" value={formData.sdt} onChange={handleChange} error={errors.sdt} placeholder="0123456789" />
          </div>

          {/* Row 2: Ngày, Mức độ, Loại */}
          <div className="flex flex-row gap-[16px] w-full mt-2 items-start">
            <div className="flex flex-col gap-[12px] w-[253px]">
              <label className="text-[14px] font-medium text-[#09090B]">Ngày gửi yêu cầu</label>
              <div className={`relative flex items-center w-full h-[40px] bg-white border ${errors.ngayGui ? 'border-red-500' : 'border-[#E4E4E7]'} rounded-[6px] px-4`}>
                <input 
                  type="date" 
                  name="ngayGui"
                  value={formData.ngayGui}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-[14px] text-[#71717A] cursor-pointer"
                />
                <Calendar size={16} className="absolute right-4 text-[#71717A] pointer-events-none" />
              </div>
              {errors.ngayGui && <span className="text-red-500 text-[12px]">{errors.ngayGui}</span>}
            </div>

            <SelectGroup label="Mức độ" name="mucDo" value={formData.mucDo} onChange={handleChange} options={["Bình thường", "Quan trọng"]} />
            <SelectGroup label="Loại sự cố" name="loaiSuCo" value={formData.loaiSuCo} onChange={handleChange} options={["Lỗi Website", "Lỗi AI"]} />
          </div>

          {/* Row 3: Tiêu đề */}
          <div className="flex flex-col gap-[12px] w-full mt-2">
            <label className="text-[14px] font-medium">Tiêu đề</label>
            <input 
              name="tieuDe"
              value={formData.tieuDe}
              onChange={handleChange}
              placeholder="Nhập tiêu đề..."
              className={`w-full h-[40px] px-4 border ${errors.tieuDe ? 'border-red-500' : 'border-[#E4E4E7]'} rounded-[6px] outline-none text-[14px]`} 
            />
            {errors.tieuDe && <span className="text-red-500 text-[12px]">{errors.tieuDe}</span>}
          </div>

          {/* Row 4: Mô tả */}
          <div className="flex flex-col gap-[12px] w-full mt-2">
            <label className="text-[14px] font-medium">Mô tả chi tiết</label>
            <textarea 
              name="moTa"
              value={formData.moTa}
              onChange={handleChange}
              placeholder="Vui lòng mô tả sự cố bạn gặp phải..."
              className={`w-full h-[120px] p-4 border ${errors.moTa ? 'border-red-500' : 'border-[#E4E4E7]'} rounded-[6px] outline-none text-[14px] resize-none`} 
            />
            {errors.moTa && <span className="text-red-500 text-[12px]">{errors.moTa}</span>}
          </div>

          {/* Tải ảnh */}
          <div className="flex flex-col gap-[16px] w-full mt-4">
            <p className="text-[14px] text-[#71717A]">Tải lên tối đa 5 ảnh minh chứng</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
            <button 
              type="button"
              onClick={handleUploadClick}
              className="flex items-center justify-center p-[8px_16px] gap-[8px] w-[130px] h-[40px] bg-white border border-black shadow-sm rounded-[6px] hover:bg-gray-50">
              <Upload size={16} />
              <span className="text-[14px] font-semibold">Tải ảnh</span>
            </button>

            <div className="flex flex-wrap gap-4 justify-center items-center w-full h-[250px] border-2 border-dashed border-[#E0E0E0] rounded-lg bg-[#FAFAFA] p-4 overflow-y-auto">
              {images.length > 0 ? (
                images.map((src, idx) => <img key={idx} src={src} className="w-24 h-24 object-cover rounded-md border shadow-sm" alt="preview" />)
              ) : (
                <span className="text-[14px] text-[#A1A1AA]">Hình ảnh sự cố sẽ hiển thị ở đây</span>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-[12px] w-full mt-8">
            
            <button 
              type="button"
              onClick={handleSubmit}
              className="px-6 h-[40px] bg-[#F26739] text-white rounded-[6px] text-[14px] font-medium hover:bg-orange-600 shadow-md transition-all">
              Báo cáo sự cố
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component con cho Input
const InputGroup = ({ label, name, value, onChange, error, placeholder }) => (
  <div className="flex flex-col gap-[12px] flex-1">
    <label className="text-[14px] font-medium text-[#09090B]">{label}</label>
    <input 
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full h-[40px] px-4 border ${error ? 'border-red-500' : 'border-[#E4E4E7]'} rounded-[6px] outline-none text-[14px] transition-all`} 
    />
    {error && <span className="text-red-500 text-[12px]">{error}</span>}
  </div>
);

// Component con cho Select
const SelectGroup = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col gap-[12px] flex-1">
    <label className="text-[14px] font-medium text-[#09090B]">{label}</label>
    <div className="relative">
      <select 
        name={name}
        value={value}
        onChange={onChange}
        className="appearance-none w-full h-[40px] px-4 bg-white border border-[#E4E4E7] rounded-[6px] outline-none text-[14px] cursor-pointer"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronsUpDown size={16} className="absolute right-4 top-3 text-[#71717A] pointer-events-none opacity-50" />
    </div>
  </div>
);

export default SuCo;