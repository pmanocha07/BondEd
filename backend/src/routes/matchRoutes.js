const express = require('express');

const matchController = require('../controllers/matchController');
const { auth, requireRole } = require('../middleware/auth');
const { validateMatchQuery } = require('../validators/matchValidators');

const router = express.Router();

router.use(auth, requireRole('student'));

router.get('/', validateMatchQuery, matchController.getMatches);

module.exports = router;