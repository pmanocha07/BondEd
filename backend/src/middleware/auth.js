const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const { verifyToken } = require('../utils/jwt');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing or invalid authorization header');
    }

    const token = header.slice(7);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError(401, 'Invalid or expired token'));
  }
}

function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(new AppError(500, 'Auth middleware must run before role guard'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden for this role'));
    }

    return next();
  };
}

module.exports = {
  auth,
  requireRole,
};