require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to database then start server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`📖 API Base URL: http://localhost:${PORT}/api`);
    logger.info(`❤️  Health: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
