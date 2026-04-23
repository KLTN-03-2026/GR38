import axios from 'axios';

// Đảm bảo URL này khớp với Postman bạn vừa chạy
const API_URL = 'http://localhost:8000/api/v1/learner-dashboard';

export const getDashboardData = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`);
        // Vì Backend trả về { success: true, data: {...} } 
        // nên ta phải lấy response.data.data
        return response.data.data; 
    } catch (error) {
        console.error("Lỗi gọi API Dashboard:", error);
        throw error;
    }
};