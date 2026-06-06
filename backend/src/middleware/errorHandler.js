const { Prisma } = require('@prisma/client');
const AppError = require('../utils/appError');

function sendError(res, statusCode, message, details) {
  return res.status(statusCode).json({
    error: message,
    details,
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message, error.details);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return sendError(res, 409, 'A record with that value already exists');
    }
  }

  if (error && error.message === 'Origin not allowed by CORS') {
    return sendError(res, 403, error.message);
  }

  console.error('[unhandled error]', error);
  return sendError(res, 500, 'Internal server error');
}

module.exports = errorHandler;