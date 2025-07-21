const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const datasetController = require('../controllers/datasetControllers');

router.get('/search', authMiddleware, datasetController.searchRecords);

module.exports = router;