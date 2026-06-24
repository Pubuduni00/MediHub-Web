// ── 404 Not Found ──
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ── Global Error Handler ──
// Must have 4 params for Express to treat it as error middleware
const errorHandler = (err, req, res, next) => {
  // Sometimes Express passes a 200 status even on errors
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // PostgreSQL specific errors
  let message = err.message;
  let errors  = null;

  // Unique constraint violation (e.g. duplicate email)
  if (err.code === '23505') {
    statusCode = 409;
    const field = err.detail?.match(/\(([^)]+)\)/)?.[1] || 'field';
    message = `${field} already exists`;
  }

  // Foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  }

  // Not null violation
  if (err.code === '23502') {
    statusCode = 400;
    message = `${err.column} is required`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError')  { message = 'Token expired'; }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    // Show stack trace only in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };
