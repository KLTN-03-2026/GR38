# File: frontend/ai-history-learning/Dockerfile

# 1. Sử dụng Node.js
FROM node:20-alpine

# 2. Tạo thư mục làm việc
WORKDIR /app

# 3. Copy file cấu hình thư viện
COPY package*.json ./

# 4. Cài đặt thư viện Frontend
RUN npm install

# 5. Copy toàn bộ mã nguồn
COPY . .

# 6. Mở cổng 3000
EXPOSE 3000

# 7. Lệnh chạy Vite với cờ --host để mở mạng ra bên ngoài container
CMD ["npm", "run", "dev", "--", "--host"]