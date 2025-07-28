const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

// POST /api/auth/register - User registration
router.post('/register', validateUserRegistration, authController.register);

// POST /api/auth/login - User login
router.post('/login', validateUserLogin, authController.login);

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router; 