const express = require('express');
const router = express.Router();

// Import controllers (to be implemented)
const {
  downloadXML,
  getXMLHistory,
  getXMLById,
  deleteXML,
  viewXML,
  configureXMLDownloadSettings
} = require('../controllers/xml.controller');

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');

// All routes below this line require authentication
router.use(authenticate);

// XML routes
router.post('/download', downloadXML);
router.get('/history', getXMLHistory);
router.get('/:id', getXMLById);
router.delete('/:id', deleteXML);
router.get('/view/:id', viewXML);
router.put('/settings', configureXMLDownloadSettings);

module.exports = router;