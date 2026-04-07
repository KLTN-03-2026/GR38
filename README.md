# Hệ thống hỗ trợ ôn tập lịch sử Việt Nam tích hợp AI

## 📌 Giới thiệu

**AI History Learning Assistant** là hệ thống hỗ trợ học tập và ôn luyện **Lịch sử Việt Nam** tích hợp trí tuệ nhân tạo.
Hệ thống giúp người học tra cứu kiến thức, luyện tập qua câu hỏi trắc nghiệm và nhận giải thích chi tiết từ AI.

Dự án được phát triển phục vụ **Khóa luận tốt nghiệp (KLTN)**.

---

## 🎯 Mục tiêu

* Hỗ trợ sinh viên học lịch sử hiệu quả hơn
* Ứng dụng AI vào giáo dục
* Tự động hóa việc tạo câu hỏi và giải thích

---

## 🚀 Công nghệ sử dụng

### 🔹 Frontend

* ReactJS + Vite
* HTML, CSS, JavaScript

### 🔹 Backend

* Node.js + Express

### 🔹 Database

* MongoDB

### 🔹 AI

* Google Gemini API

---

## ✨ Tính năng chính

* 🤖 Hỏi đáp lịch sử bằng AI (Gemini)
* 📝 Tạo câu hỏi trắc nghiệm, thẻ ghi nhớ tự động
* 📊 Theo dõi tiến trình học tập
* 🔍 Tìm kiếm thông tin nhanh

---

## ⚙️ Cài đặt & chạy dự án

### 1. Clone repository

```bash
git clone https://github.com/KLTN-03-2026/GR38.git
```

---

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

👉 Tạo file `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
GEMINI_API_KEY=your_gemini_api_key
```

Chạy server:

```bash
npm start
```

---

### 3. Cài đặt Frontend

```bash
cd frontend/ai-history-learning
npm install
npm run dev
```

---

## 🔑 Cấu hình Gemini API

1. Truy cập Google AI Studio
2. Tạo API Key
3. Thêm vào file `.env`:

```env
GEMINI_API_KEY=your_api_key
```

---

## 📂 Cấu trúc thư mục

```
GR38/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   └── ai-history-learning/
│       ├── src/
│       ├── public/
│       └── vite.config.js
│
└── README.md
```

---

## 👨‍💻 Thành viên thực hiện

* Nguyễn Tấn Hoài Anh
* Nguyễn Toàn Chung
* Lương Công Phúc
* Nguyễn Ngọc Hậu
* Trần Thanh Phương

---

## 📌 Định hướng phát triển

* Tích hợp voice (AI nói chuyện)
* Cá nhân hóa lộ trình học
* Hệ thống thi thử thông minh

---

## Ghi chú

Đây là sản phẩm trong quá trình học tập, có thể còn hạn chế và sẽ tiếp tục được cải thiện.

---
