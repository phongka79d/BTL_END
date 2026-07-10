const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const apiRoutes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { successResponse } = require('./utils/response');

const app = express();

// Cấu hình CORS và phân tích body JSON.
app.use(cors());
app.use(express.json());

// Phản hồi JSON an toàn tại health/root để kiểm tra khởi động.
app.get('/api/health', (req, res) => {
  successResponse(res, 200, 'Backend đang hoạt động bình thường', {
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Gắn các route dưới tiền tố /api.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api', apiRoutes);

// Đăng ký middleware xử lý route không tồn tại.
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Middleware xử lý lỗi toàn cục.
app.use(errorMiddleware);

module.exports = app;
