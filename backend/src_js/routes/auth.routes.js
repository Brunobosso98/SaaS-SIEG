const express = require('express');
const router = express.Router();

// Import controllers (to be implemented)
const { 
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/auth.controller');

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Email verification route
router.post('/verify-email', verifyEmail);

module.exports = router;