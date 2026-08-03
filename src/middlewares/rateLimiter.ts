import { Request } from "express";
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import jwt, { JwtPayload } from "jsonwebtoken";
import { ENV } from "../config/env";

export const adminLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,   // 30 minutes
  limit: 1,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token && token === ENV.ADMIN_API_KEY) {
      return 'admin'
    }

    return ipKeyGenerator(<string>req.ip, 56)
  },
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req, res) => ipKeyGenerator(<string>req.ip, 56),
})

// used for /filters and /games
export const generousLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 60 minutes
  limit: 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
    keyGenerator: (req) => getUserIdFromToken(req) ?? ipKeyGenerator(<string>req.ip, 56),
})

export const usersLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => getUserIdFromToken(req) ?? ipKeyGenerator(<string>req.ip, 56),
})

export const libraryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => getUserIdFromToken(req) ?? ipKeyGenerator(<string>req.ip, 56),
})

interface AppJwtPayload extends JwtPayload {
  userId: number;
}

function getUserIdFromToken(req: Request): string | null {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AppJwtPayload;
    return String(decoded.userId);
  } catch {
    return null;
  }
}