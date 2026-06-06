const { assertNoValidationErrors } = require('./common');

function validateMatchQuery(req, res, next) {
  const errors = [];
  const filters = {
    domain: null,
    minYear: null,
    maxYear: null,
  };

  if (typeof req.query.domain === 'string' && req.query.domain.trim()) {
    filters.domain = req.query.domain.trim();
  }

  if (req.query.minYear !== undefined && req.query.minYear !== '') {
    const parsedMinYear = Number(req.query.minYear);
    if (!Number.isInteger(parsedMinYear)) {
      errors.push('minYear must be an integer');
    } else {
      filters.minYear = parsedMinYear;
    }
  }

  if (req.query.maxYear !== undefined && req.query.maxYear !== '') {
    const parsedMaxYear = Number(req.query.maxYear);
    if (!Number.isInteger(parsedMaxYear)) {
      errors.push('maxYear must be an integer');
    } else {
      filters.maxYear = parsedMaxYear;
    }
  }

  if (filters.minYear !== null && filters.maxYear !== null && filters.minYear > filters.maxYear) {
    errors.push('minYear must be less than or equal to maxYear');
  }

  try {
    assertNoValidationErrors(errors);
    req.matchFilters = filters;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  validateMatchQuery,
};