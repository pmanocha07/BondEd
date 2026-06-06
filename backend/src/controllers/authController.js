const bcrypt = require('bcrypt');

const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const { signToken } = require('../utils/jwt');

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    profile: user.profile,
  };
}

async function signup(req, res, next) {
  try {
    const {
      email,
      password,
      role,
      fullName,
      gradYear,
      domain,
      interests,
      bio,
      company,
      jobTitle,
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      throw new AppError(409, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role,
        },
      });

      const createdProfile = await transaction.profile.create({
        data: {
          userId: createdUser.id,
          fullName: fullName.trim(),
          gradYear,
          domain: domain.trim(),
          interests: interests.map((interest) => interest.trim()),
          bio: bio.trim(),
          company: role === 'alumni' ? company.trim() : null,
          jobTitle: role === 'alumni' ? jobTitle.trim() : null,
        },
      });

      return {
        ...createdUser,
        profile: createdProfile,
      };
    });

    return res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    return res.status(200).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signup,
  login,
};