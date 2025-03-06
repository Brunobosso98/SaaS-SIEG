const express = require('express');
const router = express.Router();

// Import controllers (to be implemented)
const {
  getUserProfile,
  updateUserProfile,
  getUserSubscription,
  updateUserSettings,
  saveUserSiegKey,
  getUserCNPJs
} = require('../controllers/user.controller');

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');

// All routes below this line require authentication
router.use(authenticate);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// User subscription routes
router.get('/subscription', getUserSubscription);

// User settings routes
router.get('/settings', updateUserSettings);
router.put('/settings', updateUserSettings);

// SIEG key routes
router.post('/sieg-key', saveUserSiegKey);
router.get('/sieg-key', saveUserSiegKey);

// User CNPJs routes
router.get('/cnpjs', getUserCNPJs);

module.exports = router;