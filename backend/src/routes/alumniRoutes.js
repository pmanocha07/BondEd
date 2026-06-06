const express = require('express');

const profileController = require('../controllers/profileController');
const { auth } = require('../middleware/auth');
const { validateAlumniQuery, validateUserIdParam } = require('../validators/profileValidators');

const router = express.Router();

router.use(auth);

router.get('/', validateAlumniQuery, profileController.listAlumni);
router.get('/:id', validateUserIdParam, profileController.getAlumniById);

module.exports = router;