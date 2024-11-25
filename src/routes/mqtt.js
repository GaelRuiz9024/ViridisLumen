const express = require('express');
const router = express.Router();
const {getMqtt} = require('../controllers/mqtt.controller');

// Ruta de ejemplo
router.get('/mqtt', getMqtt);

module.exports = router;
