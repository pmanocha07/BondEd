const AppError = require('../utils/appError');
const { assertNoValidationErrors, validationError } = require('./common');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateConnectionCreate(req, res, next) {
  const { alumniId } = req.body;
  const errors = [];

  if (!isNonEmptyString(alumniId)) {
    errors.push('alumniId is required');
  }

  try {
    assertNoValidationErrors(errors);
    return next();
  } catch (error) {
    return next(error);
  }
}

function validateConnectionUpdate(req, res, next) {
  const { status } = req.body;
  const errors = [];
  let normalized = null;

  if (!isNonEmptyString(status)) {
    errors.push('status is required');
  } else {
    normalized = status.trim().toLowerCase();
    if (!['accepted', 'declined'].includes(normalized)) {
      errors.push('status must be accepted or declined');
    }
  }

  try {
    assertNoValidationErrors(errors);
    req.body.status = normalized;
    return next();
  } catch (error) {
    return next(error);
  }
}

function validateConnectionListQuery(req, res, next) {
  const { status } = req.query;

  if (!status) {
    return next();
  }

  const normalized = String(status).trim().toLowerCase();

  if (!['pending', 'accepted', 'declined'].includes(normalized)) {
    return next(new AppError(400, 'status must be pending, accepted, or declined'));
  }

  req.query.status = normalized;
  return next();
}

function validateConnectionIdParam(req, res, next) {
  if (!isNonEmptyString(req.params.id)) {
    return next(validationError(['id is required']));
  }

  return next();
}

module.exports = {
  validateConnectionCreate,
  validateConnectionUpdate,
  validateConnectionListQuery,
  validateConnectionIdParam,
};