import express, { RequestHandler, Router } from 'express';
const router: Router = express.Router();

// Import controllers (to be implemented)
import {
  getUserProfile,
  updateUserProfile,
  getUserSubscription,
  updateUserSettings,
  saveUserSiegKey,
  getUserCNPJs,
  updateUserPlan
} from '../controllers/user.controller';

// Import middleware
import { authenticate } from '../middleware/auth.middleware';

// All routes below this line require authentication
router.use(authenticate);

// User profile routes
router.get('/profile', getUserProfile as unknown as RequestHandler);
router.put('/profile', updateUserProfile as unknown as RequestHandler);

// User subscription routes
router.get('/subscription', getUserSubscription as unknown as RequestHandler);
router.put('/subscription', updateUserPlan as unknown as RequestHandler); // Add this line

// User settings routes
router.get('/settings', updateUserSettings as unknown as RequestHandler);
router.put('/settings', updateUserSettings as unknown as RequestHandler);

// SIEG key routes
router.post('/sieg-key', saveUserSiegKey as unknown as RequestHandler);
router.get('/sieg-key', saveUserSiegKey as unknown as RequestHandler);

// User CNPJs routes
router.get('/cnpjs', getUserCNPJs as unknown as RequestHandler);

export default router;