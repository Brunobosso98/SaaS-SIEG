import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define custom request interface with user property
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    plan: string;
    role?: string;
    [key: string]: any;
  };
}

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // Check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }
    
    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as jwt.JwtPayload;
    
    // Add user from payload to request object
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired' });
      return;
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based authorization middleware
export const authorize = (roles: string | string[] = []): (req: Request, res: Response, next: NextFunction) => void => {
  const roleArray = typeof roles === 'string' ? [roles] : roles;

  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (roleArray.length && !roleArray.includes(user.role || '')) {
      res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
};