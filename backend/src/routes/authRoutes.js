const express = require('express');

const authController = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiters');
const { validateLogin, validateSignup } = require('../validators/authValidators');

const router = express.Router();

router.post('/signup', authRateLimiter, validateSignup, authController.signup);
router.post('/login', authRateLimiter, validateLogin, authController.login);

module.exports = router;