const express = require('express');
const router = express.Router();
const { postDeviceSettings, postSensorReadings } = require('../controllers/mqtt.controller');

// Define las rutas
router.post('/deviceSettings', postDeviceSettings);
router.post('/sensorReadings', postSensorReadings);

module.exports = router;
