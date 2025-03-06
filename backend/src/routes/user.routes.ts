import express, { Router } from 'express';
const router: Router = express.Router();

// Import controllers (to be implemented)
import {
  getUserProfile,
  updateUserProfile,
  getUserSubscription,
  updateUserSettings,
  saveUserSiegKey,
  getUserCNPJs
} from '../controllers/user.controller';

// Import middleware
import { authenticate } from '../middleware/auth.middleware';

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

export default router;