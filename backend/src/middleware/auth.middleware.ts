import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Define custom request interface with user property
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    plan: string;
    role?: string;
    additionalData?: Record<string, string | number | boolean>;
  };
}

// Define JWT payload interface
interface JWTPayload {
  id: string;
  [key: string]: unknown;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided, authorization denied' });
      return;
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
    
    // Find user by id
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      res.status(401).json({ message: 'User not found, authorization denied' });
      return;
    }
    
    // Check if user's email is verified
    if (!user.verified) {
      res.status(403).json({ 
        message: 'Email not verified. Please verify your email before accessing this resource.',
        verified: false
      });
      return;
    }
    
    // Add user data to request
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      plan: user.plan
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};