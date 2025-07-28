const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

router.post('/register', validateUserRegistration, authController.register);

router.post('/login', validateUserLogin, authController.login);

router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router; 