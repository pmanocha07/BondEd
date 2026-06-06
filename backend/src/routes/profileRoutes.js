const express = require('express');

const profileController = require('../controllers/profileController');
const { auth } = require('../middleware/auth');
const { validateProfileUpdate } = require('../validators/profileValidators');

const router = express.Router();

router.use(auth);

router.get('/me', profileController.getMe);
router.put('/me', validateProfileUpdate, profileController.updateMe);

module.exports = router;