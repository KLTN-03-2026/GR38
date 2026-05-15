import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

// 1. Khởi tạo Context
const AuthContext = createContext();

// 2. Tạo Provider để bọc ứng dụng
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkLoggedInUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setRole(storedRole);
        }
      } catch (error) {
        console.error("Lỗi khi đọc LocalStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  // Hàm này dùng để cập nhật React State NGAY LẬP TỨC sau khi login/register API trả về thành công
  const setAuthUser = (userData) => {
    setUser(userData);
    setRole(userData?.role || null);
  };

  // Hàm xử lý đăng xuất đồng bộ
  const logout = () => {
    authService.logout(); // Xóa dưới LocalStorage (đã viết bên authService)
    setUser(null);        // Xóa trên React State
    setRole(null);
  };

  // Cung cấp các giá trị và hàm ra toàn cục
  return (
    <AuthContext.Provider value={{ user, role, setAuthUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook để các Component lấy dữ liệu nhanh gọn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
};