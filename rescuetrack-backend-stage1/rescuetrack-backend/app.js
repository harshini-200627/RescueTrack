
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

import config from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import responderRoutes from './routes/responderRoutes.js';

import {
  notFound,
  errorHandler,
} from './middleware/errorMiddleware.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: config.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Health check
app.get('/api/health', (_req, res) => {
  const states = [
    'disconnected',
    'connected',
    'connecting',
    'disconnecting',
  ];

  res.status(200).json({
    success: true,
    service: 'RescueTrack API',
    status: 'ok',
    environment: config.nodeEnv,
    database:
      states[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Incident management routes
app.use('/api/incidents', incidentRoutes);

// Responder management routes
app.use('/api/responders', responderRoutes);

// Error handlers must be last
app.use(notFound);
app.use(errorHandler);

export default app;
