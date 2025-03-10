import express, { Router, RequestHandler } from 'express';
const router: Router = express.Router();

// Import controllers (to be implemented)
import {
  downloadXML,
  getXMLHistory,
  getXMLById,
  deleteXML,
  viewXML,
  configureXMLDownloadSettings,
  executeUserXmlDownload,
  getXmlDownloadStatus
} from '../controllers/xml.controller';

// Import middleware
import { authenticate } from '../middleware/auth.middleware';

// All routes below this line require authentication
router.use(authenticate);

// XML routes
router.post('/download', downloadXML as unknown as RequestHandler);
router.post('/execute-download', executeUserXmlDownload as unknown as RequestHandler);
router.get('/download-status', getXmlDownloadStatus as unknown as RequestHandler);
router.get('/history', getXMLHistory as unknown as RequestHandler);
router.get('/:id', getXMLById as unknown as RequestHandler);
router.delete('/:id', deleteXML as unknown as RequestHandler);
router.get('/view/:id', viewXML as unknown as RequestHandler);
router.put('/settings', configureXMLDownloadSettings as unknown as RequestHandler);

export default router;