import mongoose from 'mongoose';
import config, { validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';

let server;

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  const finish = async () => {
    try {
      await mongoose.connection.close();
    } finally {
      process.exit(0);
    }
  };
  if (server) {
    server.close(finish);
    setTimeout(() => process.exit(1), 10000).unref();
  } else {
    await finish();
  }
};

const start = async () => {
  try {
    validateEnv();
    await connectDB();

    server = app.listen(config.port, () => {
      console.log(`RescueTrack API running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`Health check: http://localhost:${config.port}/api/health`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

start();
