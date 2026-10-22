const dotenv = require('dotenv');
// Load environment variables before any other module imports
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start listening
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Campus Lost & Found Portal - Backend API Server  `);
      console.log(`====================================================`);
      console.log(`  Status    : Running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`  Port      : ${PORT}`);
      console.log(`  API URL   : http://localhost:${PORT}/api`);
      console.log(`  Health    : http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`[Server Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
