import express, { Router } from 'express';
const router: Router = express.Router();

// Import controllers (to be implemented)
import {
  getAllCNPJs,
  getCNPJById,
  addCNPJ,
  updateCNPJ,
  deleteCNPJ
} from '../controllers/cnpj.controller';

// Import middleware
import { authenticate } from '../middleware/auth.middleware';

// All routes below this line require authentication
router.use(authenticate);

// CNPJ routes
router.get('/', getAllCNPJs);
router.get('/:id', getCNPJById);
router.post('/', addCNPJ);
router.put('/:id', updateCNPJ);
router.delete('/:id', deleteCNPJ);

export default router;