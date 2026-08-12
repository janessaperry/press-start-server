import { timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";
import { ENV } from "../config/env";

export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Admin key missing' });
  }

  const tokenBuffer = Buffer.from(token);
  const keyBuffer = Buffer.from(ENV.ADMIN_API_KEY);

  if (tokenBuffer.length !== keyBuffer.length || !timingSafeEqual(tokenBuffer, keyBuffer)) {
    return res.status(403).json({ message: 'Invalid admin key' });
  }

  next();
}