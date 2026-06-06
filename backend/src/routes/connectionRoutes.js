const express = require('express');

const connectionController = require('../controllers/connectionController');
const { auth } = require('../middleware/auth');
const {
  validateConnectionCreate,
  validateConnectionIdParam,
  validateConnectionUpdate,
  validateConnectionListQuery,
} = require('../validators/connectionValidators');

const router = express.Router();

router.use(auth);

router.post('/', validateConnectionCreate, connectionController.createConnection);
router.patch('/:id', validateConnectionIdParam, validateConnectionUpdate, connectionController.updateConnection);
router.get('/', validateConnectionListQuery, connectionController.listConnections);

module.exports = router;