import express, { Router } from 'express';
const router: Router = express.Router();

// Import controllers (to be implemented)
import {
  downloadXML,
  getXMLHistory,
  getXMLById,
  deleteXML,
  viewXML,
  configureXMLDownloadSettings
} from '../controllers/xml.controller';

// Import middleware
import { authenticate } from '../middleware/auth.middleware';

// All routes below this line require authentication
router.use(authenticate);

// XML routes
router.post('/download', downloadXML);
router.get('/history', getXMLHistory);
router.get('/:id', getXMLById);
router.delete('/:id', deleteXML);
router.get('/view/:id', viewXML);
router.put('/settings', configureXMLDownloadSettings);

export default router;