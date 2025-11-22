import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

// Middleware to restrict access based on user role
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Role '${req.user?.role}' does not have access.`,
      });
    }
    next();
  };
};
