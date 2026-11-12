import mongoose from 'mongoose';
import config from './env.js';

mongoose.set('strictQuery', true);

/**
 * Connects to MongoDB Atlas using MONGODB_URI.
 * Throws on failure so the caller (server.js) can exit cleanly.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    console.log(`MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

export default connectDB;
