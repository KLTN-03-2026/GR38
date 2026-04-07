# Hệ thống hỗ trợ ôn tập lịch sử Việt Nam tích hợp AI

## 📌 Giới thiệu

**AI History Learning Assistant** là hệ thống hỗ trợ học tập và ôn luyện **Lịch sử Việt Nam** tích hợp trí tuệ nhân tạo.
Hệ thống giúp người học tra cứu kiến thức, luyện tập qua câu hỏi trắc nghiệm và nhận giải thích chi tiết từ AI.

Dự án được phát triển phục vụ **Khóa luận tốt nghiệp (KLTN)**.

---

## 👨‍💻 Thành viên thực hiện

* Nguyễn Tấn Hoài Anh
* Nguyễn Toàn Chung
* Lương Công Phúc
* Nguyễn Ngọc Hậu
* Trần Thanh Phương

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

* Hỏi đáp lịch sử bằng AI (Gemini)
* Tạo câu hỏi trắc nghiệm, thẻ ghi nhớ tự động
* Theo dõi tiến trình học tập
* Tìm kiếm thông tin nhanh

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
## Quy trình làm việc với Git
### Các bước push code 
 
#### Bước 1 — Cập nhật dev mới nhất trước khi làm
 
```bash
git checkout dev
git pull origin dev
```
#### Bước 2 — Tạo nhánh mới từ dev
```bash
git checkout -b ten_tinh_nang
```
#### Bước 3 — Code và commit thường xuyên
 
```bash
git add .
git commit -m "mô tả những gì đã làm"
```
#### Bước 4 — Push nhánh lên remote
 
```bash
git push origin ten_tinh_nang
```
### Quy tắc chung
 
- ❌ **KHÔNG push thẳng lên `main` hoặc `dev`**
- ❌ **KHÔNG commit file `.env`** (đã có trong `.gitignore`)
- ✅ **Pull dev mới nhất** trước khi bắt đầu làm
- ✅ **Commit nhỏ, thường xuyên** — không để dồn quá nhiều thay đổi
- ✅ **Mỗi tính năng một nhánh** riêng
- ✅ **Review code** trước khi merge
---
## Định hướng phát triển

* Tích hợp voice (AI nói chuyện)
* Cá nhân hóa lộ trình học
* Hệ thống thi thử thông minh

---

## Ghi chú

Đây là sản phẩm trong quá trình học tập, có thể còn hạn chế và sẽ tiếp tục được cải thiện.

---
