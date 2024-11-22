const express = require('express');
const router = express.Router();
const {getResumen} = require('../controllers/resumen.controller');

// Ruta de ejemplo
router.get('/resumen', getResumen);

module.exports = router;
