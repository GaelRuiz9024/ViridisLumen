const express = require('express');
const { login,  logout, verifySession } = require('../controllers/auth.controller');
const router = express.Router();

// Rutas
router.post('/login', login); // Ruta para el login
router.get('/logout', logout); // Ruta para cerrar sesión
router.get('/verifySession', verifySession); // Ruta para cerrar sesión

module.exports = router;




