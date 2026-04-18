# File: backend/Dockerfile

# 1. Sử dụng image Node.js bản nhẹ (Alpine) phiên bản 20
FROM node:20-alpine

# 2. Tạo thư mục làm việc bên trong container
WORKDIR /app

# 3. Copy 2 file package.json và package-lock.json vào trước
# Mục đích: Tận dụng cache của Docker, giúp những lần build sau nhanh hơn
COPY package*.json ./

# 4. Cài đặt các thư viện Node.js
RUN npm install

# 5. Copy toàn bộ mã nguồn còn lại vào container
COPY . .

# 6. Mở cổng 8000 để giao tiếp với bên ngoài
EXPOSE 8000

# 7. Lệnh khởi chạy server (Thay đổi tùy theo scripts trong package.json của bạn)
# Nếu bạn dùng nodemon để dev: CMD ["npm", "run", "dev"]
# Nếu chạy chuẩn: CMD ["node", "server.js"]
CMD ["node", "server.js"]