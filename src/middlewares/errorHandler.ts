import { NextFunction, Request, Response } from "express";
import { AppError, RateLimitingError, ValidationError } from "../errors/AppError";

export function errorHandler (err: Error, req: Request, res: Response, next: NextFunction) {
  // todo log the error - update to pino?
  console.error("errorHandler - err", err);

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