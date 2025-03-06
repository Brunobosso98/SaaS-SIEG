import express, { Router } from 'express';
const router: Router = express.Router();

// Import controllers (to be implemented)
import { 
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail
} from '../controllers/auth.controller';

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Email verification route
router.post('/verify-email', verifyEmail);

export default router;