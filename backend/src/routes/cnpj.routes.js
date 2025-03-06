const express = require('express');
const router = express.Router();

// Import controllers (to be implemented)
const {
  getAllCNPJs,
  getCNPJById,
  addCNPJ,
  updateCNPJ,
  deleteCNPJ
} = require('../controllers/cnpj.controller');

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');

// All routes below this line require authentication
router.use(authenticate);

// CNPJ routes
router.get('/', getAllCNPJs);
router.get('/:id', getCNPJById);
router.post('/', addCNPJ);
router.put('/:id', updateCNPJ);
router.delete('/:id', deleteCNPJ);

module.exports = router;