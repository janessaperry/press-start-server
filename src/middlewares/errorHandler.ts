import { NextFunction, Request, Response } from "express";
import { AppError, RateLimitingError, ValidationError } from "../errors/AppError";
import { logger } from "../errors/logger";

export function errorHandler (err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error({ err }, err.message);

  if (err instanceof AppError) {
    const errors = err instanceof ValidationError ? err.errors : undefined;
    const retryAfter = err instanceof RateLimitingError ? err.retryAfter : undefined;

    res.status(err.statusCode).json({
      message: err.message,
      errors,
      retryAfter
    })
    return;
  }

  res.status(500).json({
    message: "Something went wrong. Try again later."
  })
}