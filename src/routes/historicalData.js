const express = require('express');
const router = express.Router();
const {getHistoricalData} = require('../controllers/historicalData.controller');

// Ruta de ejemplo
router.get('/historicalData', getHistoricalData);

module.exports = router;