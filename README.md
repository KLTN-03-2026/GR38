# AI History Learning Assistant

<div align="center">

**Hệ thống hỗ trợ ôn tập Lịch sử Việt Nam tích hợp Trí tuệ nhân tạo**
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-v5+-brightgreen.svg)](https://www.mongodb.com)
[![React](https://img.shields.io/badge/React-v18+-blue.svg)](https://react.dev)


</div>

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Hướng dẫn cài đặt & chạy](#hướng-dẫn-cài-đặt--chạy)
- [Cấu hình biến môi trường](#cấu-hình-biến-môi-trường-env)
- [Cấu trúc thư mục chính](#cấu-trúc-thư-mục-chính)
- [Hướng dẫn sử dụng API](#hướng-dẫn-sử-dụng-api)
- [Quy trình làm việc với Git](#quy-trình-làm-việc-với-git)
- [Định hướng phát triển tương lai](#định-hướng-phát-triển-tương-lai)
- [Thông tin đồ án](#thông-tin-đồ-án)


---

## Giới thiệu

**AI History Learning Assistant** là ứng dụng giúp người học ôn tập **Lịch sử Việt Nam** dễ dàng hơn nhờ sử dụng **Trí tuệ nhân tạo (AI)**.

### Mục đích của dự án

- Giúp người học học lịch sử hiệu quả hơn
- Tạo sự tương tác giữa giáo viên và người học
- Tự động tạo đề thi, flashcard từ AI
- Theo dõi tiến độ học tập của từng người học
- Giúp người học học theo cách phù hợp nhất

### Điểm mạnh chính

 Đặc điểm | Mô tả |
|---------|-------|
| **AI-Powered** | Tích hợp Google Gemini API để hỏi đáp, tạo câu hỏi và giải thích tự động |
| **Full-Stack** | Frontend React + Backend Node.js + Database MongoDB |
| **Real-time** | Hệ thống thông báo và hoạt động theo thời gian thực |
| **Multi-role** | Hỗ trợ 3 vai trò: Admin, Giáo viên, Học sinh |
| **Responsive** | Giao diện đẹp mắt với Tailwind CSS |

---

## Tính năng chính

### Giáo viên có thể làm gì?

| Tính năng | Mô tả |
|---------|-------|
| **Quản lý Tài liệu** | Tải lên, chỉnh sửa, xóa tài liệu lịch sử. Hỗ trợ PDF, hình ảnh |
| **Tạo Bài Kiểm Tra (Quiz)** | Tạo bài kiểm tra với AI hoặc thủ công, tự động đánh giá |
| **Tạo Flashcard** | Tạo bộ thẻ ghi nhớ tự động từ tài liệu bằng AI |
| **Xem Thống Kê & Báo Cáo** | Theo dõi tiến độ học sinh, phân tích kết quả kiểm tra |
| **Hoạt động Gần Đây** | Xem nhật ký hoạt động của học sinh theo thời gian thực |
| **Quản lý Thông báo** | Gửi thông báo đến học sinh khi có tài liệu mới |

### Người học có thể làm gì?

| Tính năng | Mô tả |
|---------|-------|
| **Đọc Tài liệu** | Xem tài liệu lịch sử với giao diện dễ sử dụng |
| **Làm Bài Kiểm Tra** | Làm quiz, xem đáp án và giải thích chi tiết từ AI |
| **Học qua Flashcard** | Ôn tập hiệu quả qua thẻ ghi nhớ tương tác |
| **Theo Dõi Tiến Độ** | Xem thống kê học tập, điểm số và tiến độ |
| **Nhận Thông báo** | Nhận thông báo theo thời gian thực khi giáo viên đăng tài liệu mới |
| **Hỏi Đáp với AI** | Chat với AI (Gemini) để hỏi về nội dung lịch sử |

### AI có thể giúp gì?

| Tính năng AI | Mô tả |
|-------------|-------|
| **Trả lời câu hỏi** | AI trả lời các câu hỏi về lịch sử Việt Nam một cách chi tiết |
| **Tạo câu hỏi tự động** | Tự động tạo câu hỏi trắc nghiệm từ tài liệu |
| **Tạo Flashcard** | Tự động tạo flashcard từ nội dung tài liệu |
| **Giải thích chi tiết** | Cung cấp giải thích kỹ lưỡng cho từng câu hỏi |
| **Tóm tắt nội dung** | Tóm tắt tài liệu dài thành các điểm chính |

---

## Công nghệ sử dụng

### Frontend (Phần website)

| Công nghệ | Phiên bản | Mục đích |
|----------|----------|---------|
| **React** | 18.3.1 | Framework UI chính |
| **Vite** | 8.0.10 | Build tool nhanh |
| **Tailwind CSS** | 4.2.4 | Styling và responsive design |
| **React Router DOM** | 7.14.0 | Routing và navigation |
| **Axios** | 1.15.1 | HTTP client cho API |
| **React Hot Toast** | 2.6.0 | Notification system |
| **Recharts** | 3.8.1 | Charts và data visualization |
| **Lucide React** | 1.14.0 | Icon library |
| **React Markdown** | 10.1.0 | Markdown rendering |
| **SweetAlert2** | 11.26.24 | Beautiful alerts |
| **@react-oauth/google** | 0.13.5 | Google OAuth integration |

### Backend (Phần server)

| Công nghệ | Phiên bản | Mục đích |
|----------|----------|---------|
| **Node.js** | 18+ |Nền tảng chạy JavaScript trên server |
| **Express** | 5.2.1 |Framework xây dựng API |
| **MongoDB** |5.0+ | Cơ sở dữ liệu (lưu trữ dữ liệu) |
| **Mongoose** | 9.3.1 |Thư viện kết nối MongoDB |
| **JWT** | 9.0.3 |Xác thực người dùng |
| **Bcrypt** | 6.0.0 | Mã hóa mật khẩu |
| **Google Gemini API**| 0.24.1 | AI trả lời câu hỏi, tạo đề thi |
| **Cloudinary**| 1.41.3 | Lưu trữ ảnh, PDF trên cloud |
| **Multer** | 2.1.1 | Xử lý upload tệp |
| **Nodemailer**| 8.0.7 | Gửi email |
| **Swagger**| 6.2.8 | Tài liệu API tự động |

### Database (Kho dữ liệu)

- **MongoDB**: Lưu trữ người dùng, tài liệu, quiz, flashcard, vv.

### Services

- **Google Gemini API**: AI để trả lời, tạo đề, tạo flashcard
- **Cloudinary**: Lưu ảnh, PDF
- **Gmail SMTP**: Gửi email

---

## Hướng dẫn cài đặt & chạy

### Bước 1: Tải code về máy

Mở **Command Prompt** (Windows) hoặc **Terminal** (Mac/Linux) rồi chạy:

```bash
git clone https://github.com/KLTN-03-2026/GR38.git
cd AIHistoryLearning
```

### Bước 2: Cài đặt Backend (Phần server)

**Backend** là phần xử lý logic, kết nối database, tích hợp AI.

```bash
# Vào thư mục backend
cd backend

# Cài đặt các thư viện cần thiết
npm install

# Tạo file .env (xem phần dưới)
cp .env.example .env

# Chạy backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:8000`

### Bước 3: Cài đặt Frontend (Phần website)

**Frontend** là giao diện website mà người dùng sẽ thấy.

Mở **cửa sổ Terminal mới** rồi chạy:

```bash
# Vào thư mục frontend
cd frontend/ai-history-learning

# Cài đặt các thư viện cần thiết
npm install

# Chạy website
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Bước 4: Kiểm tra xem đã chạy được chưa

Mở trình duyệt (Chrome, Firefox, vv) và truy cập:

- **Website**: `http://localhost:3000`
- **API Docs**: `http://localhost:8000/docs`

---

## Cấu hình biến môi trường (.env)

**File .env** chứa các thông tin nhạy cảm như password, API key. KHÔNG được commit lên GitHub!

### 📄 Tạo file .env cho Backend

Tạo file có tên `.env` trong thư mục `backend/` với nội dung:

```env
# ===== DATABASE (Kho dữ liệu) =====
# Nếu dùng MongoDB cục bộ:
MONGODB_URI=mongodb://localhost:27017/ai_history_learning

# Hoặc nếu dùng MongoDB Atlas (online):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# ===== SERVER (Cài đặt máy chủ) =====
PORT=8000                              # Cổng chạy backend
NODE_ENV=development                   # Chế độ phát triển
CLIENT_URL=http://localhost:3000       # Địa chỉ frontend
MAX_FILE_SIZE=10485760                 # Dung lượng tệp tối đa (10MB)

# ===== JWT (Xác thực) =====
JWT_SECRET=dat_mat_khau_tuy_y_tai_day  # Mật khẩu bí mật cho token
JWT_EXPIRE=7d                          # Token hết hạn sau 7 ngày

# ===== GEMINI AI (Trí tuệ nhân tạo) =====
GEMINI_API_KEY=nhap_api_key_cua_ban_o_day

# ===== CLOUDINARY (Lưu trữ ảnh, PDF) =====
CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=api_key_cloudinary
CLOUDINARY_API_SECRET=api_secret_cloudinary

# ===== GOOGLE OAUTH (Đăng nhập bằng Google) =====
GG_CLIENT_ID=client_id_google_cua_ban
GG_CLIENT_SECRET=client_secret_google_cua_ban

# ===== EMAIL (Gửi email) =====
EMAIL_USER=your_gmail_address@gmail.com     # Gmail của bạn
EMAIL_APP_PASSWORD=app_password_cua_ban     # Password ứng dụng Gmail (không phải mật khẩu thường)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
```

### Hướng dẫn lấy API Keys

#### Google Gemini API Key

1. Vào: https://aistudio.google.com/
2. Bấm **"Get API Key"**
3. Copy key vào `GEMINI_API_KEY`

#### MongoDB URI

**Cách 1: Dùng MongoDB cục bộ (trên máy bạn)**
- Cài MongoDB: https://www.mongodb.com/try/download/community
- Chạy MongoDB
- Dùng: `mongodb://localhost:27017/ai_history_learning`

**Cách 2: Dùng MongoDB Atlas (online)**
1. Tạo tài khoản: https://www.mongodb.com/cloud/atlas
2. Tạo cluster (cơ sở dữ liệu)
3. Lấy connection string
4. Thay username, password vào

#### Cloudinary (Lưu ảnh, PDF)

1. Đăng ký: https://cloudinary.com/
2. Vào Dashboard
3. Copy: Cloud Name, API Key, API Secret
4. Dán vào `.env`

#### Gmail SMTP (Gửi email)

1. Mở Gmail: https://myaccount.google.com/
2. Bật **2-Step Verification** (Xác thực 2 bước)
3. Vào **App passwords**
4. Tạo password cho "Mail"
5. Copy password đó vào `EMAIL_APP_PASSWORD`

#### Google OAuth (Đăng nhập Google)

1. Vào: https://console.cloud.google.com/
2. Tạo project mới
3. Tạo OAuth 2.0 credentials
4. Copy `Client ID` và `Client Secret`

### Frontend (.env - Tùy chọn)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GG_CLIENT_ID=client_id_google_cua_ban
```

---

## Cấu trúc thư mục chính

### Backend - Phần xử lý logic

```
AIHistoryLearning/
│
├── backend/                          # Backend Node.js + Express
│   ├── config/                       # Cấu hình (Database, Swagger, Upload)
│   │   ├── db.js                     # Kết nối MongoDB
│   │   ├── swagger.js                # Cấu hình Swagger/OpenAPI
│   │   ├── uploadImage.js            # Tải ảnh lên Cloudinary
│   │   └── uploadPdf.js              # Tải PDF lên Cloudinary
│   │
│   ├── controllers/                  # Logic xử lý (Controllers)
│   │   ├── Auth/
│   │   │   ├── authController.js     # Logic xác thực (Đăng nhập/Đăng ký)
│   │   │   └── userController.js     # Quản lý người dùng
│   │   ├── Flashcard/
│   │   │   ├── flashcardSetController.js
│   │   │   └── flashcardProgressController.js
│   │   ├── Quiz/
│   │   │   ├── quizController.js
│   │   │   └── quizResultController.js
│   │   ├── aiController.js           # Tích hợp AI
│   │   ├── documentController.js     # Quản lý tài liệu
│   │   ├── adminController.js        # Chức năng của quản trị viên (Admin)
│   │   ├── activityController.js     # Ghi nhật ký hoạt động
│   │   ├── notificationController.js # Hệ thống thông báo
│   │   ├── progressController.js     # Tiến độ học tập
│   │   └── reportController.js       # Báo cáo
│   │
│   ├── middleware/                   # Middleware của Express
│   │   ├── auth.js                   # Xác thực bằng JWT
│   │   └── errorHandler.js           # Xử lý lỗi toàn cục
│   │
│   ├── models/                       # Cấu trúc dữ liệu (Schemas) MongoDB
│   │   ├── User.js                   # Bảng người dùng
│   │   ├── Document.js               # Bảng tài liệu
│   │   ├── Quiz.js                   # Bảng bài kiểm tra (Quiz)
│   │   ├── Flashcard.js              # Bảng thẻ ghi nhớ (Flashcard)
│   │   ├── FlashcardProgress.js      # Theo dõi tiến độ thẻ ghi nhớ
│   │   ├── QuizResult.js             # Kết quả bài kiểm tra
│   │   ├── Activity.js               # Nhật ký hoạt động
│   │   ├── Notification.js           # Thông báo
│   │   ├── ChatHistory.js            # Lịch sử trò chuyện
│   │   ├── Course.js                 # Bảng khóa học
│   │   ├── Report.js                 # Bảng báo cáo
│   │   └── ...
│   │
│   ├── routes/                       # Các tuyến đường API (Routes)
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
│   ├── utils/                        # Các hàm tiện ích (Utils)
│   │   ├── geminiService.js          # Dịch vụ gói gọn API Gemini
│   │   ├── pdfParser.js              # Trích xuất văn bản từ PDF
│   │   ├── textChunker.js            # Chia nhỏ văn bản cho AI xử lý
│   │   ├── notificationService.js    # Tiện ích tạo thông báo
│   │   └── activityLogger.js         # Tiện ích ghi log hoạt động
│   │
│   ├── scripts/                      # Kịch bản chạy tiện ích (Scripts)
│   │   └── seedAdmin.js              # Tạo tài khoản admin ban đầu
│   │
│   ├── docs/                         # Tài liệu API (định dạng YAML)
│   │   ├── auth.yaml
│   │   ├── document.yaml
│   │   ├── flashcard.yaml
│   │   ├── quiz.yaml
│   │   └── ...
│   │
│   ├── server.js                     # Điểm bắt đầu chạy server (Entry point)
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   └── ai-history-learning/          # Frontend React + Vite
│       ├── public/                   # Các tệp tĩnh (Static files)
│       │
│       ├── src/
│       │   ├── components/           # Các thành phần giao diện (Components) tái sử dụng
│       │   │   ├── Layout/
│       │   │   │   ├── Header.jsx
│       │   │   │   └── Sidebar.jsx
│       │   │   ├── features/
│       │   │   │   ├── documents/    # Thành phần cho tài liệu
│       │   │   │   ├── flashcards/   # Thành phần cho thẻ ghi nhớ
│       │   │   │   ├── quizzes/      # Thành phần cho bài kiểm tra
│       │   │   │   ├── profile/      # Thành phần cho hồ sơ
│       │   │   │   └── quizResults/  # Thành phần cho kết quả kiểm tra
│       │   │   ├── Modal/            # Các hộp thoại Modal
│       │   │   └── ...
│       │   │
│       │   ├── pages/                # Các thành phần trang (Pages)
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
│       │   │   │   ├── TienDo.jsx      
│       │   │   │   ├── SuCo.jsx       
│       │   │   │   └── BaiGiang/       
│       │   │   ├── Teacher/
│       │   │   │   ├── Documents/
│       │   │   │   ├── Flashcards/
│       │   │   │   └── Quizzes/
│       │   │   └── NotFoundPage.jsx
│       │   │
│       │   ├── services/             # Dịch vụ gọi API
│       │   │   ├── authService.js
│       │   │   ├── documentService.js
│       │   │   ├── flashcardService.js
│       │   │   ├── quizService.js
│       │   │   ├── aiService.js
│       │   │   └── dashboardService.js
│       │   │
│       │   ├── context/              # Quản lý trạng thái toàn cục (React Context)
│       │   │   └── AuthContext.jsx
│       │   │
│       │   ├── hooks/                # Các hooks tự tạo (Custom hooks)
│       │   │   ├── useLogin.js
│       │   │   └── useRegister.js
│       │   │
│       │   ├── lib/                  # Thư viện tùy chỉnh
│       │   │   └── api.js            # Cấu hình đối tượng Axios
│       │   │
│       │   ├── utils/                # Các hàm tiện ích Frontend
│       │   │   └── auth.js
│       │   │
│       │   ├── assets/               # Hình ảnh, phông chữ (Tài nguyên)
│       │   │   └── img/
│       │   │
│       │   ├── App.jsx               # Thành phần ứng dụng chính
│       │   ├── main.jsx              # Điểm bắt đầu chạy React
│       │   ├── router.jsx            # Định nghĩa các tuyến đường (Router)
│       │   └── index.css             # CSS toàn cục
│       │
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       ├── Dockerfile
│       └── index.html
│
├── docker-compose.yml                # Cấu hình Docker Compose
├── setup.bat                         # Kịch bản cài đặt cho Windows
├── README.md                         # Tài liệu giới thiệu dự án
└── .gitignore                        
---


## Quy trình làm việc với Git

### Quy trình chung

#### Bước 1️ — Cập nhật dev mới nhất

```bash
git checkout dev
git pull origin dev
```

#### Bước 2 — Tạo nhánh mới

```bash
# Tên nhánh phải mô tả rõ tính năng, tên người làm
git checkout -b hoaianh_document/upload
# hoặc
git checkout -b hoaianh_fix/login-bug
```

#### Bước 3 — Code và commit thường xuyên

```bash
# Xem thay đổi
git status

# Thêm files vào staging
git add .

# Commit với message mô tả rõ
git commit -m "feat: add document upload functionality"
```

#### Bước 4 — Push nhánh lên 

```bash
git push origin feature/document-upload
```

#### Bước 5 — Tạo Pull Request

- Vào GitHub
- Tạo PR từ nhánh của bạn vào `dev`
- Mô tả thay đổi, test cases
- Chờ review từ team

### Quy tắc Commit

```bash
git commit -m "ghi ro phan da lam"
```

### 🚫 Quy tắc bắt buộc

| Luật lệ | Chi tiết |
|--------|---------|
| ❌ KHÔNG push main | Chỉ push vào nhánh feature |
| ❌ KHÔNG push dev | Chỉ qua Pull Request |
| ❌ KHÔNG commit .env | Thêm vào .gitignore |
| ❌ KHÔNG commit node_modules | Sử dụng .gitignore |
| ✅ LUÔN pull trước làm việc | Cập nhật dev mới nhất |
| ✅ LUÔN viết commit message rõ | Dễ review, dễ revert |
| ✅ LUÔN test trước push | Đảm bảo code chạy |

### Xử lý Merge Conflicts

```bash
# Nếu có conflict khi pull
git pull origin dev
# Edit files để resolve conflict
git add .
git commit -m "resolve: merge conflicts with dev"
git push origin feature/your-feature
```

---

## Định hướng phát triển tương lai

Đăng nhập, đăng ký tài khoản  
Tải tài liệu lên  
Làm bài kiểm tra  
Học flashcard  
Chat hỏi AI  
Xem tiến độ học tập  

### Giai đoạn tiếp theo (Nâng cao)

**Tính năng âm thanh**
- AI nói chuyện (text-to-speech)
- Nhận dạng giọng nói (speech-to-text)
- Học phát âm lịch sử

**Học tập cá nhân hóa**
- AI gợi ý lộ trình học dựa trên điểm yếu
- Ôn lại kiến thức theo thời gian (spaced repetition)
- Điều chỉnh độ khó bài tập

**Thi thử thông minh**
- Tự động tạo đề thi
- Phân tích điểm yếu
- Gợi ý ôn tập

### Tương lai xa (Phát triển thêm)

Gamification (điểm, badges, xếp hạng)  
Hỗ trợ nhiều môn học  
Ứng dụng mobile (React Native / Flutter)  
Đa ngôn ngữ  

---

## Thông tin đồ án

| STT | Họ tên | MSSV | Email |
|-----|--------|------|-------|
| 1 | Nguyễn Tấn Hoài Anh | 28211337211 | hoaianhh204@gmail.com |
| 2 | Nguyễn Toàn Chung | 28211100231 | chungnguyen.11122004@gmail.com |
| 3 | Lương Công Phúc | 28210243034 | luongcongphuc1@gmail.com |
| 4 | Nguyễn Ngọc Hậu | 28210203284 | ngochau999n@gmail.com |
| 5 | Trần Thanh Phương | 28211105084 | thanhphuong1722004@gmail.com |

### Giáo viên hướng dẫn

| Họ tên | Chức vụ |
|--------|--------|
| TS. Trương Tiến Vũ | Giáo viên hướng dẫn đồ án |

### Thông tin đề tài

- **Tên đề tài**: Xây dựng Hệ thống hỗ trợ ôn tập lịch sử Việt Nam tích hợp AI
- **Trường**: Đại Học Duy Tân
- **Năm học**: 2025-2026
- **GitHub**: https://github.com/KLTN-03-2026/GR38.git

---

## Liên hệ & Hỗ trợ

| Kênh | Thông tin |
|-----|----------|
| 📧 Email | hoaianhh204@gmail.com |

---

<div align="center">

**Cảm ơn các bạn đã sử dụng AI History Learning Assistant!**

Made with by Team GR38 | 2025-2026

</div>
