const express = require('express');
const { login, dashboard, logout } = require('../controllers/auth.controller');
const router = express.Router();

// Rutas
router.post('/login', login); // Ruta para el login
router.get('/logout', logout); // Ruta para cerrar sesión

module.exports = router;
