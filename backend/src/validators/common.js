const AppError = require('../utils/appError');

function validationError(details) {
  return new AppError(400, 'Validation failed', details);
}

function assertNoValidationErrors(errors) {
  if (errors.length > 0) {
    throw validationError(errors);
  }
}

module.exports = {
  validationError,
  assertNoValidationErrors,
};