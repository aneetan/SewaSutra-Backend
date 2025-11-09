import { NextFunction, Request, Response } from "express";

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = res.locals.user;
      
      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          error: "Access denied. Insufficient permissions",
          requiredRoles: allowedRoles,
          userRole: user.role
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: "Authorization error" });
    }
  };
};

// Specific role middlewares for convenience
export const requireCompany = requireRole(['COMPANY']);
export const requireClient = requireRole(['CLIENT']);
export const requireAdmin = requireRole(['ADMIN']);
export const requireCompanyOrClient = requireRole(['COMPANY', 'CLIENT']);