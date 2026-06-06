const AppError = require('../utils/appError');
const { assertNoValidationErrors } = require('./common');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateProfileUpdate(req, res, next) {
  const {
    fullName,
    gradYear,
    domain,
    interests,
    bio,
    company,
    jobTitle,
  } = req.body;

  const errors = [];

  if (!isNonEmptyString(fullName)) {
    errors.push('fullName is required');
  }

  if (!Number.isInteger(gradYear)) {
    errors.push('gradYear must be an integer');
  }

  if (!isNonEmptyString(domain)) {
    errors.push('domain is required');
  }

  if (!Array.isArray(interests) || interests.length === 0 || interests.some((interest) => !isNonEmptyString(interest))) {
    errors.push('interests must be a non-empty array of strings');
  }

  if (!isNonEmptyString(bio)) {
    errors.push('bio is required');
  }

  if (req.user && req.user.role === 'alumni') {
    if (!isNonEmptyString(company)) {
      errors.push('company is required for alumni');
    }

    if (!isNonEmptyString(jobTitle)) {
      errors.push('jobTitle is required for alumni');
    }
  }

  try {
    assertNoValidationErrors(errors);
    return next();
  } catch (error) {
    return next(error);
  }
}

function validateAlumniQuery(req, res, next) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const errors = [];

  if (!Number.isInteger(page) || page < 1) {
    errors.push('page must be a positive integer');
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    errors.push('limit must be an integer between 1 and 50');
  }

  try {
    assertNoValidationErrors(errors);
    req.pagination = { page, limit };
    return next();
  } catch (error) {
    return next(error);
  }
}

function validateUserIdParam(req, res, next) {
  if (!isNonEmptyString(req.params.id)) {
    return next(new AppError(400, 'id is required'));
  }

  return next();
}

module.exports = {
  validateProfileUpdate,
  validateAlumniQuery,
  validateUserIdParam,
};