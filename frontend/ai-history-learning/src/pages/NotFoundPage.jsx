import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ArrowLeft, Home } from "lucide-react"; 

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 px-4">
      <div className="relative mb-8">
        <Map className="w-32 h-32 text-slate-300" strokeWidth={1} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-slate-800 opacity-80">
          404
        </div>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 text-center">
        Lạc bước trong dòng lịch sử!
      </h1>
      
      <p className="text-slate-500 mb-8 max-w-md text-center text-lg">
        Tài liệu hoặc trang bạn đang tìm kiếm dường như không tồn tại, hoặc đã bị xóa mờ bởi bụi thời gian.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center px-6 py-3 border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại dòng thời gian
        </button>
        
        <button 
          onClick={() => navigate('/')}
          className="flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors cursor-pointer"
        >
          <Home className="w-5 h-5 mr-2" />
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;