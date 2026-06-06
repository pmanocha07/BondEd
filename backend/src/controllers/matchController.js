const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const { scoreMatch } = require('../utils/matchScore');

function getYearRange() {
  const configured = Number(process.env.MATCH_GRAD_YEAR_RANGE);
  return Number.isInteger(configured) && configured >= 0 ? configured : 3;
}

function isMatchingFilter(alumniProfile, filters) {
  if (filters.domain && String(alumniProfile.domain).trim().toLowerCase() !== String(filters.domain).trim().toLowerCase()) {
    return false;
  }

  if (filters.minYear !== null && alumniProfile.gradYear < filters.minYear) {
    return false;
  }

  if (filters.maxYear !== null && alumniProfile.gradYear > filters.maxYear) {
    return false;
  }

  return true;
}

async function getMatches(req, res, next) {
  try {
    if (req.user.role !== 'student') {
      throw new AppError(403, 'Only students can access matching');
    }

    if (!req.user.profile) {
      throw new AppError(404, 'Student profile not found');
    }

    const filters = req.matchFilters || { domain: null, minYear: null, maxYear: null };

    const alumni = await prisma.user.findMany({
      where: { role: 'alumni' },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    const rankedMatches = alumni
      .filter((user) => user.profile && isMatchingFilter(user.profile, filters))
      .map((user) => ({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        profile: user.profile,
        score: scoreMatch(req.user.profile, user.profile, { yearRange: getYearRange() }),
      }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return String(left.profile.fullName || '').localeCompare(String(right.profile.fullName || ''));
      });

    return res.status(200).json({ data: rankedMatches });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMatches,
};