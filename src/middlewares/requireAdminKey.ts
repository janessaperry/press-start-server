import { NextFunction, Request, Response } from "express";
import { ENV } from "../config/env";

export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Admin key missing' });
  }

  if (token !== ENV.ADMIN_API_KEY) {
    return res.status(403).json({ message: 'Invalid admin key' });
  }

  next();
}