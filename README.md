# AI Student – AI Quiz Platform

## Công nghệ
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL + Sequelize
- AI tạo câu hỏi: Google Gemini API

## 1. Yêu cầu
- Node.js 18 trở lên (khuyến nghị Node.js 20)
- MySQL Server đang chạy
- Khóa Google Gemini nếu muốn dùng chức năng tạo câu hỏi bằng AI

## 2. Cấu hình database và biến môi trường
Mở `backend/.env` và kiểm tra `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`.

Không chia sẻ file `.env` công khai vì có thể chứa mật khẩu database và API key. Nếu file `.env` bị mất, tạo lại theo các biến trên; đặt `FRONTEND_URL=http://localhost:5173` và `PORT=5000` khi chạy local.

Mở `frontend/.env`, đặt:

```env
VITE_API_URL=http://localhost:5000/api
```

Tạo database MySQL với tên trùng `DB_NAME` trong `backend/.env` trước khi chạy backend. Ứng dụng gọi `sequelize.sync({ alter: true })` để đồng bộ model khi khởi động; nên sao lưu database nếu đã có dữ liệu.

## 3. Chạy backend
Mở Terminal thứ nhất tại thư mục `AIStudent/backend`:

```powershell
npm install
npm run dev
```

Hoặc chạy chế độ thông thường:

```powershell
npm start
```

Khi chạy thành công, API mặc định ở `http://localhost:5000`. Kiểm tra bằng trình duyệt: `http://localhost:5000/api/health`.

## 4. Chạy frontend
Mở Terminal thứ hai tại thư mục `AIStudent/frontend`:

```powershell
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong Terminal, thường là `http://localhost:5173`.

## 5. Lưu ý
- Không chạy `npm start` ở thư mục gốc `AIStudent`, vì các lệnh chạy được khai báo riêng trong `backend` và `frontend`.
- Frontend và backend phải chạy đồng thời ở hai Terminal.
- Nếu backend báo lỗi kết nối MySQL, kiểm tra MySQL đang chạy và thông tin trong `backend/.env`.
- Nếu đăng nhập báo lỗi 401, kiểm tra token và tài khoản trong database.
- Không có tài khoản demo được tự động tạo chỉ từ mã nguồn; cần đăng ký tài khoản hoặc tạo dữ liệu ban đầu theo logic ứng dụng.
