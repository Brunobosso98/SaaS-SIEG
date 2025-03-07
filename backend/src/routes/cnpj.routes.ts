import express, { Router, Request, Response, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
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
router.get('/', getAllCNPJs as unknown as RequestHandler);
router.get('/:id', getCNPJById as unknown as RequestHandler);
router.post('/', addCNPJ as unknown as RequestHandler);
router.put('/:id', updateCNPJ as unknown as RequestHandler);
router.delete('/:id', deleteCNPJ as unknown as RequestHandler);

export default router;