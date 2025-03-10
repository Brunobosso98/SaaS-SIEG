import express, { RequestHandler, Router } from 'express';
const router: Router = express.Router();

// Import controllers
import {
  getUserProfile,
  updateUserProfile,
  getUserSubscription,
  getUserSettings,
  updateUserSettings,
  saveUserSiegKey,
  getUserCNPJs,
  updateUserPlan,
  getDocumentTypes,
  updateDocumentTypes,
  deleteDocumentType,
  getDownloadDirectory,
  updateDownloadDirectory,
  getRetentionPeriod,
  updateRetentionPeriod,
  getNotificationSettings,
  updateNotificationSettings
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
router.put('/subscription', updateUserPlan as unknown as RequestHandler);

// User settings routes - general settings
router.get('/settings', getUserSettings as unknown as RequestHandler);
router.put('/settings', updateUserSettings as unknown as RequestHandler);

// Document types routes
router.get('/settings/document-types', getDocumentTypes as unknown as RequestHandler);
router.post('/settings/document-types', updateDocumentTypes as unknown as RequestHandler);
router.delete('/settings/document-types', deleteDocumentType as unknown as RequestHandler);

// Download directory routes
router.get('/settings/download-directory', getDownloadDirectory as unknown as RequestHandler);
router.put('/settings/download-directory', updateDownloadDirectory as unknown as RequestHandler);

// Retention period routes
router.get('/settings/retention', getRetentionPeriod as unknown as RequestHandler);
router.put('/settings/retention', updateRetentionPeriod as unknown as RequestHandler);

// Notification settings routes
router.get('/settings/notifications', getNotificationSettings as unknown as RequestHandler);
router.put('/settings/notifications', updateNotificationSettings as unknown as RequestHandler);

// SIEG key routes
router.post('/sieg-key', saveUserSiegKey as unknown as RequestHandler);
router.get('/sieg-key', saveUserSiegKey as unknown as RequestHandler);

// User CNPJs routes
router.get('/cnpjs', getUserCNPJs as unknown as RequestHandler);

export default router;