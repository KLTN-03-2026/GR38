# 🎓 AI History Learning Assistant

<div align="center">

**Hệ thống hỗ trợ ôn tập Lịch sử Việt Nam tích hợp Trí tuệ nhân tạo**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-v5+-brightgreen.svg)](https://www.mongodb.com)
[![React](https://img.shields.io/badge/React-v18+-blue.svg)](https://react.dev)

[🌐 Demo](#) • [📚 Tài liệu](#cài-đặt--chạy-dự-án) • [🚀 Bắt đầu](#hướng-dẫn-cài-đặt-nhanh) • [💬 Hỗ trợ](#thông-tin-liên-hệ)

</div>

---

## 📋 Mục lục

- [🎯 Giới thiệu](#-giới-thiệu)
- [✨ Tính năng nổi bật](#-tính-năng-nổi-bật)
- [🛠️ Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [⚡ Hướng dẫn cài đặt nhanh](#-hướng-dẫn-cài-đặt-nhanh)
- [🔧 Cấu hình biến môi trường](#-cấu-hình-biến-môi-trường)
- [📁 Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [🗂️ Mô tả các thư mục chính](#-mô-tả-các-thư-mục-chính)
- [📖 Hướng dẫn sử dụng API](#-hướng-dẫn-sử-dụng-api)
- [📚 Quy trình làm việc với Git](#-quy-trình-làm-việc-với-git)
- [🚀 Định hướng phát triển](#-định-hướng-phát-triển)
- [👥 Thông tin nhóm](#-thông-tin-nhóm)
- [📝 Ghi chú](#-ghi-chú)

---

## 🎯 Giới thiệu

**AI History Learning Assistant** là một nền tảng học tập toàn diện được thiết kế để giúp **học sinh ôn tập Lịch sử Việt Nam** một cách **sinh động, tương tác và hiệu quả** nhờ sự hỗ trợ của **Trí tuệ nhân tạo (AI)**.

### 🎓 Sứ mệnh của dự án

Dự án nhằm:
- 🔹 **Nâng cao hiệu quả học tập** lịch sử thông qua công nghệ AI hiện đại
- 🔹 **Tăng tương tác giữa giáo viên và học sinh** bằng cách tự động hóa quá trình tạo nội dung giáo dục
- 🔹 **Cung cấp công cụ hỗ trợ học tập** toàn diện từ quản lý tài liệu đến theo dõi tiến độ
- 🔹 **Cá nhân hóa quá trình học tập** dựa trên nhu cầu và tiến độ của từng học sinh

### 📊 Đặc điểm nổi bật

| Đặc điểm | Mô tả |
|---------|-------|
| **AI-Powered** | Tích hợp Google Gemini API để hỏi đáp, tạo câu hỏi và giải thích tự động |
| **Full-Stack** | Frontend React + Backend Node.js + Database MongoDB |
| **Real-time** | Hệ thống thông báo và hoạt động theo thời gian thực |
| **Multi-role** | Hỗ trợ 3 vai trò: Admin, Giáo viên, Học sinh |
| **Responsive** | Giao diện đẹp mắt với Tailwind CSS + ShadcnUI |

---

## ✨ Tính năng nổi bật

### 👨‍🏫 Dành cho Giáo viên

| Tính năng | Mô tả |
|---------|-------|
| 📄 **Quản lý Tài liệu** | Tải lên, chỉnh sửa, xóa tài liệu lịch sử. Hỗ trợ PDF, hình ảnh |
| ✏️ **Tạo Bài Kiểm Tra (Quiz)** | Tạo bài kiểm tra với AI hoặc thủ công, tự động đánh giá |
| 🎴 **Tạo Flashcard** | Tạo bộ thẻ ghi nhớ tự động từ tài liệu bằng AI |
| 📊 **Xem Thống Kê & Báo Cáo** | Theo dõi tiến độ học sinh, phân tích kết quả kiểm tra |
| 📝 **Hoạt động Gần Đây** | Xem nhật ký hoạt động của học sinh theo thời gian thực |
| 🔔 **Quản lý Thông báo** | Gửi thông báo đến học sinh khi có tài liệu mới |

### 👨‍🎓 Dành cho Người Học

| Tính năng | Mô tả |
|---------|-------|
| 📖 **Đọc Tài liệu** | Xem tài liệu lịch sử với giao diện dễ sử dụng |
| 🧪 **Làm Bài Kiểm Tra** | Làm quiz, xem đáp án và giải thích chi tiết từ AI |
| 🎴 **Học qua Flashcard** | Ôn tập hiệu quả qua thẻ ghi nhớ tương tác |
| 📊 **Theo Dõi Tiến Độ** | Xem thống kê học tập, điểm số và tiến độ |
| 🔔 **Nhận Thông báo** | Nhận thông báo theo thời gian thực khi giáo viên đăng tài liệu mới |
| 💬 **Hỏi Đáp với AI** | Chat với AI (Gemini) để hỏi về nội dung lịch sử |

### 🤖 Tích hợp AI (Google Gemini API)

| Tính năng AI | Mô tả |
|-------------|-------|
| 💭 **Trả lời câu hỏi** | AI trả lời các câu hỏi về lịch sử Việt Nam một cách chi tiết |
| ❓ **Tạo câu hỏi tự động** | Tự động tạo câu hỏi trắc nghiệm từ tài liệu |
| 📚 **Tạo Flashcard** | Tự động tạo flashcard từ nội dung tài liệu |
| 🔍 **Giải thích chi tiết** | Cung cấp giải thích kỹ lưỡng cho từng câu hỏi |
| ✍️ **Tóm tắt nội dung** | Tóm tắt tài liệu dài thành các điểm chính |

---

## 🛠️ Công nghệ sử dụng

### 🎨 Frontend

| Công nghệ | Phiên bản | Mục đích |
|----------|----------|---------|
| **React** | 18.3.1 | Framework UI chính |
| **Vite** | 8.0.10 | Build tool nhanh |
| **Tailwind CSS** | 4.2.4 | Styling và responsive design |
| **ShadcnUI** | Latest | Bộ component UI tái sử dụng |
| **React Router DOM** | 7.14.0 | Routing và navigation |
| **Axios** | 1.15.1 | HTTP client cho API |
| **React Hot Toast** | 2.6.0 | Notification system |
| **Recharts** | 3.8.1 | Charts và data visualization |
| **Lucide React** | 1.14.0 | Icon library |
| **React Markdown** | 10.1.0 | Markdown rendering |
| **SweetAlert2** | 11.26.24 | Beautiful alerts |
| **@react-oauth/google** | 0.13.5 | Google OAuth integration |

### 🚀 Backend

| Công nghệ | Phiên bản | Mục đích |
|----------|----------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.2.1 | Web framework |
| **MongoDB** | 5.0+ | NoSQL database |
| **Mongoose** | 9.3.1 | MongoDB ODM |
| **JWT** | 9.0.3 | Authentication & authorization |
| **Bcrypt** | 6.0.0 | Password hashing |
| **Nodemailer** | 8.0.7 | Email service |
| **Google Gemini API** | 0.24.1 | AI integration |
| **Cloudinary** | 1.41.3 | Image/file hosting |
| **Multer** | 2.1.1 | File upload middleware |
| **Axios** | 1.15.2 | HTTP client |
| **Swagger/OpenAPI** | 6.2.8 | API documentation |
| **PDF-Parse** | 2.4.5 | PDF text extraction |
| **CORS** | 2.8.6 | Cross-origin resource sharing |
| **Dotenv** | 17.3.1 | Environment variables |
| **Express Validator** | 7.3.1 | Request validation |

### 💾 Database

- **MongoDB**: NoSQL database để lưu trữ dữ liệu người dùng, tài liệu, quiz, flashcard, vv.

### 🔑 Services

- **Google Gemini API**: AI để tạo câu hỏi, flashcard, trả lời câu hỏi
- **Cloudinary**: Hosting hình ảnh và tệp PDF
- **Gmail SMTP**: Gửi email xác thực và thông báo

---

## ⚡ Hướng dẫn cài đặt nhanh

### 📌 Yêu cầu hệ thống

```
Node.js v18+
npm v9+ hoặc yarn
MongoDB v5+
Git
```

### 🔄 Bước 1: Clone repository

```bash
git clone https://github.com/KLTN-03-2026/GR38.git
cd AIHistoryLearning
```

### 🎯 Bước 2: Cài đặt Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env (xem mục cấu hình biến môi trường)
cp .env.example .env

# Khởi chạy server
npm run dev
```

Server sẽ chạy tại `http://localhost:8000`

### 🎨 Bước 3: Cài đặt Frontend

```bash
cd ../frontend/ai-history-learning

# Cài đặt dependencies
npm install

# Tạo file .env (nếu cần)
touch .env

# Khởi chạy development server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

### ✅ Bước 4: Kiểm tra cài đặt

```bash
# Kiểm tra API docs
curl http://localhost:8000/docs

# Kiểm tra frontend
open http://localhost:5173
```

---

## 🔧 Cấu hình biến môi trường

### 📄 Backend (.env)

Tạo file `.env` trong thư mục `backend` với nội dung:

```env
# === DATABASE ===
MONGODB_URI=mongodb://username:password@localhost:27017/ai_history_learning
# Hoặc MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database

# === SERVER ===
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760  # 10MB

# === JWT ===
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# === GOOGLE GEMINI AI ===
GEMINI_API_KEY=your_gemini_api_key_here

# === CLOUDINARY (Image/File Storage) ===
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# === GOOGLE OAUTH ===
GG_CLIENT_ID=your_google_oauth_client_id
GG_CLIENT_SECRET=your_google_oauth_client_secret

# === EMAIL SERVICE (Gmail SMTP) ===
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password  # Không phải mật khẩu thường
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
```

### 📝 Frontend (.env - nếu cần)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 🔑 Hướng dẫn lấy API Keys

#### Google Gemini API
1. Truy cập [Google AI Studio](https://aistudio.google.com/)
2. Bấm "Get API Key"
3. Copy API key vào `.env`

#### MongoDB
1. Tạo tài khoản [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster
3. Copy connection string vào `MONGODB_URI`

#### Cloudinary
1. Đăng ký [Cloudinary](https://cloudinary.com/)
2. Lấy `Cloud Name`, `API Key`, `API Secret` từ Dashboard
3. Copy vào `.env`

#### Gmail SMTP
1. Bật [2-Step Verification](https://myaccount.google.com/security) trong Gmail
2. Tạo [App Password](https://myaccount.google.com/apppasswords)
3. Copy vào `EMAIL_APP_PASSWORD`

#### Google OAuth
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo OAuth 2.0 credentials
3. Copy `Client ID` và `Client Secret`

---

## 📁 Cấu trúc thư mục

```
AIHistoryLearning/
│
├── backend/                          # 🚀 Backend Node.js + Express
│   ├── config/                       # Cấu hình (Database, Swagger, Upload)
│   │   ├── db.js                     # Kết nối MongoDB
│   │   ├── swagger.js                # Swagger/OpenAPI config
│   │   ├── uploadImage.js            # Cloudinary upload image
│   │   └── uploadPdf.js              # Cloudinary upload PDF
│   │
│   ├── controllers/                  # Logic xử lý
│   │   ├── Auth/
│   │   │   ├── authController.js     # Authentication logic
│   │   │   └── userController.js     # User management
│   │   ├── Flashcard/
│   │   │   ├── flashcardSetController.js
│   │   │   └── flashcardProgressController.js
│   │   ├── Quiz/
│   │   │   ├── quizController.js
│   │   │   └── quizResultController.js
│   │   ├── aiController.js           # AI integration
│   │   ├── documentController.js     # Document management
│   │   ├── adminController.js        # Admin functions
│   │   ├── activityController.js     # Activity logging
│   │   ├── notificationController.js # Notification system
│   │   ├── progressController.js     # Learning progress
│   │   └── reportController.js       # Reports
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                   # JWT authentication
│   │   └── errorHandler.js           # Global error handler
│   │
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js                   # User schema
│   │   ├── Document.js               # Document schema
│   │   ├── Quiz.js                   # Quiz schema
│   │   ├── Flashcard.js              # Flashcard schema
│   │   ├── FlashcardProgress.js      # Progress tracking
│   │   ├── QuizResult.js             # Quiz results
│   │   ├── Activity.js               # Activity logging
│   │   ├── Notification.js           # Notifications
│   │   ├── ChatHistory.js            # Chat history
│   │   ├── Course.js                 # Course schema
│   │   ├── Report.js                 # Report schema
│   │   └── ...
│   │
│   ├── routes/                       # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── flashcardRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── activityRoutes.js
│   │   └── ...
│   │
│   ├── utils/                        # Utility functions
│   │   ├── geminiService.js          # AI service wrapper
│   │   ├── pdfParser.js              # PDF text extraction
│   │   ├── textChunker.js            # Text chunking for AI
│   │   ├── notificationService.js    # Notification utilities
│   │   └── activityLogger.js         # Activity logging utilities
│   │
│   ├── scripts/                      # Utility scripts
│   │   └── seedAdmin.js              # Seed initial admin
│   │
│   ├── docs/                         # API documentation (YAML)
│   │   ├── auth.yaml
│   │   ├── document.yaml
│   │   ├── flashcard.yaml
│   │   ├── quiz.yaml
│   │   └── ...
│   │
│   ├── server.js                     # Entry point
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   └── ai-history-learning/          # 🎨 Frontend React + Vite
│       ├── public/                   # Static files
│       │
│       ├── src/
│       │   ├── components/           # Reusable components
│       │   │   ├── Layout/
│       │   │   │   ├── Header.jsx
│       │   │   │   └── Sidebar.jsx
│       │   │   ├── features/
│       │   │   │   ├── documents/    # Document components
│       │   │   │   ├── flashcards/   # Flashcard components
│       │   │   │   ├── quizzes/      # Quiz components
│       │   │   │   ├── profile/      # Profile components
│       │   │   │   └── quizResults/  # Quiz result components
│       │   │   ├── Modal/            # Modal dialogs
│       │   │   └── ...
│       │   │
│       │   ├── pages/                # Page components
│       │   │   ├── Auth/
│       │   │   │   ├── LoginPage.jsx
│       │   │   │   ├── RegisterPage.jsx
│       │   │   │   └── Errors.jsx
│       │   │   ├── Admin/
│       │   │   │   ├── AdminDashboard.jsx
│       │   │   │   ├── AccountManagement.jsx
│       │   │   │   └── ReportManagement.jsx
│       │   │   ├── Learner/
│       │   │   │   ├── Dashboard.jsx
│       │   │   │   ├── Documents.jsx
│       │   │   │   ├── Flashcards.jsx
│       │   │   │   ├── Quizzes.jsx
│       │   │   │   ├── TienDo.jsx (Progress)
│       │   │   │   ├── SuCo.jsx (Incidents)
│       │   │   │   └── BaiGiang/ (Lessons)
│       │   │   ├── Teacher/
│       │   │   │   ├── Documents/
│       │   │   │   ├── Flashcards/
│       │   │   │   └── Quizzes/
│       │   │   └── NotFoundPage.jsx
│       │   │
│       │   ├── services/             # API services
│       │   │   ├── authService.js
│       │   │   ├── documentService.js
│       │   │   ├── flashcardService.js
│       │   │   ├── quizService.js
│       │   │   ├── aiService.js
│       │   │   └── dashboardService.js
│       │   │
│       │   ├── context/              # React Context
│       │   │   └── AuthContext.jsx
│       │   │
│       │   ├── hooks/                # Custom hooks
│       │   │   ├── useLogin.js
│       │   │   └── useRegister.js
│       │   │
│       │   ├── lib/                  # Libraries
│       │   │   └── api.js            # Axios instance
│       │   │
│       │   ├── utils/                # Utility functions
│       │   │   └── auth.js
│       │   │
│       │   ├── assets/               # Images, fonts
│       │   │   └── img/
│       │   │
│       │   ├── App.jsx               # Main app component
│       │   ├── main.jsx              # React entry point
│       │   ├── router.jsx            # Route definitions
│       │   └── index.css             # Global styles
│       │
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       ├── .env.example
│       ├── Dockerfile
│       └── index.html
│
├── docker-compose.yml                # Docker Compose configuration
├── setup.bat                         # Windows setup script
├── README.md                         # Project documentation
└── .gitignore                        # Git ignore rules
```

---

## 🗂️ Mô tả các thư mục chính

### Backend Controllers

| Controller | Chức năng |
|-----------|---------|
| `authController.js` | Đăng ký, đăng nhập, làm mới token |
| `userController.js` | Quản lý hồ sơ, mật khẩu, thông tin người dùng |
| `documentController.js` | Tạo, chỉnh sửa, xóa tài liệu; trích xuất văn bản PDF |
| `quizController.js` | Tạo, chỉnh sửa quiz; lấy câu hỏi |
| `quizResultController.js` | Lưu kết quả, tính điểm, lấy thống kê |
| `flashcardSetController.js` | Quản lý bộ flashcard |
| `flashcardProgressController.js` | Theo dõi tiến độ học flashcard |
| `aiController.js` | Tạo câu hỏi/flashcard bằng AI, hỏi đáp |
| `adminController.js` | Quản lý người dùng, duyệt giáo viên |
| `notificationController.js` | Gửi, lấy thông báo |
| `activityController.js` | Ghi log hoạt động |
| `reportController.js` | Tạo báo cáo |

### Database Models

| Model | Mô tả |
|-------|-------|
| `User` | Người dùng (Admin, Teacher, Learner) |
| `Document` | Tài liệu lịch sử (PDF, ảnh) |
| `Quiz` | Bài kiểm tra trắc nghiệm |
| `Flashcard` | Thẻ ghi nhớ |
| `FlashcardProgress` | Tiến độ học flashcard |
| `QuizResult` | Kết quả làm quiz |
| `Activity` | Nhật ký hoạt động |
| `Notification` | Thông báo hệ thống |
| `ChatHistory` | Lịch sử chat với AI |
| `Course` | Khóa học |
| `Report` | Báo cáo |

---

## 📖 Hướng dẫn sử dụng API

### 📚 Swagger Documentation

Sau khi khởi chạy backend, bạn có thể xem API documentation tại:

```
http://localhost:8000/docs
```

### 🔐 Authentication

Hầu hết các endpoint đều yêu cầu JWT token. Gửi token trong header:

```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
  http://localhost:8000/api/v1/user/profile
```

### 📝 Ví dụ API Calls

#### 1. Đăng nhập

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### 2. Tải lên tài liệu

```bash
curl -X POST http://localhost:8000/api/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "title=Tiêu đề tài liệu"
```

#### 3. Tạo quiz bằng AI

```bash
curl -X POST http://localhost:8000/api/v1/ai/generate-quiz \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc_id",
    "numberOfQuestions": 5
  }'
```

#### 4. Hỏi đáp với AI

```bash
curl -X POST http://localhost:8000/api/v1/ai/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Chiến tranh Việt Nam kéo dài bao lâu?"
  }'
```

---

## 📚 Quy trình làm việc với Git

### 🔄 Quy trình chung

#### Bước 1️⃣ — Cập nhật dev mới nhất

```bash
git checkout dev
git pull origin dev
```

#### Bước 2️⃣ — Tạo nhánh mới

```bash
# Tên nhánh phải ngắn gọn, mô tả rõ tính năng
git checkout -b feature/document-upload
# hoặc
git checkout -b fix/login-bug
```

#### Bước 3️⃣ — Code và commit thường xuyên

```bash
# Xem thay đổi
git status

# Thêm files vào staging
git add .

# Commit với message mô tả rõ
git commit -m "feat: add document upload functionality"
```

#### Bước 4️⃣ — Push nhánh lên remote

```bash
git push origin feature/document-upload
```

#### Bước 5️⃣ — Tạo Pull Request

- Vào GitHub / GitLab
- Tạo PR từ nhánh của bạn vào `dev`
- Mô tả thay đổi, test cases
- Chờ review từ team

### ✅ Quy tắc Commit

```bash
# Format: <type>(<scope>): <subject>
#
# type: feat, fix, docs, style, refactor, test, chore
# scope: auth, document, quiz, flashcard, ai, admin
# subject: mô tả ngắn gọn, viết thường, không dùng dấu chấm

# ✅ Đúng
git commit -m "feat(document): add pdf upload with cloudinary"
git commit -m "fix(auth): resolve jwt token expiration issue"
git commit -m "docs(readme): update installation guide"

# ❌ Sai
git commit -m "update code"
git commit -m "Fix bug"
git commit -m "WIP"
```

### 🚫 Quy tắc bắt buộc

| Luật lệ | Chi tiết |
|--------|---------|
| ❌ KHÔNG push main | Chỉ push vào nhánh feature |
| ❌ KHÔNG push dev | Chỉ qua Pull Request |
| ❌ KHÔNG commit .env | Thêm vào .gitignore |
| ❌ KHÔNG commit node_modules | Sử dụng .gitignore |
| ❌ KHÔNG push lớn > 50MB | Chia nhỏ commits |
| ✅ LUÔN pull trước làm việc | Cập nhật dev mới nhất |
| ✅ LUÔN viết commit message rõ | Dễ review, dễ revert |
| ✅ LUÔN test trước push | Đảm bảo code chạy |

### 🔄 Xử lý Merge Conflicts

```bash
# Nếu có conflict khi pull
git pull origin dev
# Edit files để resolve conflict
git add .
git commit -m "resolve: merge conflicts with dev"
git push origin feature/your-feature
```

### 📋 Branch Naming Convention

```
feature/<feature-name>      # Tính năng mới
fix/<bug-name>              # Sửa lỗi
docs/<documentation-name>   # Tài liệu
refactor/<refactor-name>    # Tái cấu trúc code
```

---

## 🚀 Định hướng phát triển

### 📌 Giai đoạn 1: MVP (Hiện tại)
- ✅ Xác thực người dùng (Auth)
- ✅ Quản lý tài liệu
- ✅ Tạo quiz bằng AI
- ✅ Học flashcard
- ✅ Hỏi đáp với AI
- ✅ Theo dõi tiến độ

### 🔮 Giai đoạn 2: Nâng cao

- 🎙️ **Tích hợp Voice**
  - AI nói chuyện (text-to-speech)
  - Nhận dạng giọng nói (speech-to-text)

- 🎯 **Cá nhân hóa Học tập**
  - Đề xuất lộ trình học tập dựa trên điểm yếu
  - Adaptive learning paths
  - Spaced repetition algorithm

- 📊 **Hệ thống Thi Thử Thông minh**
  - Tạo đề thi tự động
  - Phân tích điểm yếu
  - Đề xuất ôn tập

### 🌟 Giai đoạn 3: Tối ưu hóa

- 🏆 **Gamification**
  - Hệ thống điểm, badges, leaderboard
  - Challenges hàng tuần

- 🌍 **Mở rộng phạm vi**
  - Thêm môn học khác
  - Hỗ trợ đa ngôn ngữ

- 📱 **Mobile App**
  - React Native hoặc Flutter

---

## 👥 Thông tin nhóm

### 👨‍🎓 Thành viên thực hiện

| STT | Họ tên | MSSV | Vai trò | Email |
|-----|--------|------|--------|-------|
| 1 | Nguyễn Tấn Hoài Anh | 21110XXX | Project Lead, Full-stack | [email] |
| 2 | Nguyễn Toàn Chung | 21110XXX | Backend Developer | [email] |
| 3 | Lương Công Phúc | 21110XXX | Full-stack Developer | [email] |
| 4 | Nguyễn Ngọc Hậu | 21110XXX | Frontend Developer | [email] |
| 5 | Trần Thanh Phương | 21110XXX | Frontend Developer | [email] |

### 👨‍🏫 Giáo viên hướng dẫn

| Họ tên | Chức vụ | Email |
|--------|--------|-------|
| TS. [Tên GV] | Giáo viên hướng dẫn | [email] |

### 🏫 Thông tin Đề tài

- **Tên Đề tài**: Xây dựng Hệ thống hỗ trợ ôn tập lịch sử Việt Nam tích hợp AI
- **Loại DATN**: Ứng dụng phần mềm / Đồ án tốt nghiệp
- **Trường/Khoa**: [Trường/Khoa]
- **Năm học**: 2025-2026
- **Repository**: [GitHub Link]

---

## 🔗 Tài liệu tham khảo

- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [ShadcnUI Components](https://ui.shadcn.com/)

---

## 📝 Ghi chú

### ⚠️ Lưu ý quan trọng

- 🔐 **Bảo mật**: KHÔNG commit file `.env` chứa API keys. Sử dụng `.env.example` làm template.
- 📦 **Dependencies**: Luôn chạy `npm install` sau khi pull code mới.
- 🐳 **Docker**: Nếu sử dụng Docker, xem `docker-compose.yml`.
- 📊 **Database**: Đảm bảo MongoDB đang chạy trước khi khởi động backend.
- 🧪 **Testing**: Chạy các test trước khi push code.

### 🐛 Báo cáo lỗi

Nếu phát hiện lỗi, vui lòng:
1. Kiểm tra xem lỗi đã được báo cáo chưa
2. Tạo Issue mới với:
   - Mô tả chi tiết
   - Steps to reproduce
   - Expected vs Actual result
   - Environment info

### 💡 Đề xuất tính năng

Nếu có ý tưởng mới:
1. Mở Discussion hoặc Issue
2. Mô tả tính năng và lợi ích
3. Chờ feedback từ team lead

---

## 📄 License

Dự án này được phát hành dưới giấy phép **MIT**. Xem file [LICENSE](LICENSE) để biết chi tiết.

---

## 📞 Thông tin liên hệ

| Kênh | Chi tiết |
|-----|---------|
| 📧 Email | [team-email@example.com] |
| 💬 Discord | [Discord Server] |
| 📱 Phone | [Contact Number] |
| 🌐 Website | [Project Website] |

---

<div align="center">

### ⭐ Nếu dự án hữu ích, vui lòng ⭐ Star repository!

**Cảm ơn bạn đã sử dụng AI History Learning Assistant!**

Made with ❤️ by Team GR38 | Năm học 2025-2026

</div>
