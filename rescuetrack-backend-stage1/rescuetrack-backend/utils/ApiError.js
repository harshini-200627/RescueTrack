/**
 * Operational error carrying an HTTP status code.
 * Thrown by controllers/middleware and formatted by errorMiddleware.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default ApiError;
