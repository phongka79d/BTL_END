const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { successResponse } = require('./utils/response');

const app = express();

// Configure CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Safe health/root JSON response for startup verification
app.get('/api/health', (req, res) => {
  successResponse(res, 200, 'Backend is healthy', {
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Mount routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', userRoutes);

// Register not-found middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
