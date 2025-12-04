import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  userId?: number;
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as any;
    
    // Add userId to request object
    req.userId = decoded.user.id; // or decoded.id, depending on your JWT payload  
    req.user = decoded.user ;  
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
