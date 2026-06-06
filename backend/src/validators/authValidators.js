const { assertNoValidationErrors } = require('./common');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateSignup(req, res, next) {
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

  const errors = [];

  if (!isNonEmptyString(email)) {
    errors.push('email is required');
  }

  if (!isNonEmptyString(password) || password.length < 8) {
    errors.push('password must be at least 8 characters');
  }

  if (role !== 'student' && role !== 'alumni') {
    errors.push('role must be student or alumni');
  }

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

  if (role === 'alumni') {
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

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!isNonEmptyString(email)) {
    errors.push('email is required');
  }

  if (!isNonEmptyString(password)) {
    errors.push('password is required');
  }

  try {
    assertNoValidationErrors(errors);
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  validateSignup,
  validateLogin,
};