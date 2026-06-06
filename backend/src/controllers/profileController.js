const prisma = require('../config/prisma');
const AppError = require('../utils/appError');

function toProfileResponse(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    profile: user.profile,
  };
}

function toAlumniResponse(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    profile: user.profile,
  };
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError(404, 'Profile not found');
    }

    return res.status(200).json({ user: toProfileResponse(user) });
  } catch (error) {
    return next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const {
      fullName,
      gradYear,
      domain,
      interests,
      bio,
      company,
      jobTitle,
    } = req.body;

    const profile = req.user.profile;

    if (!profile) {
      throw new AppError(404, 'Profile not found');
    }

    const profileData = {
      fullName: fullName.trim(),
      gradYear,
      domain: domain.trim(),
      interests: interests.map((interest) => interest.trim()),
      bio: bio.trim(),
    };

    if (req.user.role === 'alumni') {
      profileData.company = company.trim();
      profileData.jobTitle = jobTitle.trim();
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: profileData,
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    return res.status(200).json({ user: toProfileResponse({ ...updatedUser, profile: updatedProfile }) });
  } catch (error) {
    return next(error);
  }
}

async function listAlumni(req, res, next) {
  try {
    const page = req.pagination.page;
    const limit = req.pagination.limit;
    const skip = (page - 1) * limit;

    const [total, alumni] = await prisma.$transaction([
      prisma.user.count({ where: { role: 'alumni' } }),
      prisma.user.findMany({
        where: { role: 'alumni' },
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return res.status(200).json({
      data: alumni.map(toAlumniResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getAlumniById(req, res, next) {
  try {
    const alumni = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        role: 'alumni',
      },
      include: { profile: true },
    });

    if (!alumni) {
      throw new AppError(404, 'Alumni profile not found');
    }

    return res.status(200).json({ alumni: toAlumniResponse(alumni) });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMe,
  updateMe,
  listAlumni,
  getAlumniById,
};