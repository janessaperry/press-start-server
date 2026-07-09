import { NextFunction, Request, Response } from "express";
import { AppError, ValidationError } from "../errors/AppError";

export function errorHandler (err: Error, req: Request, res: Response, next: NextFunction) {
  // todo log the error - update to pino?
  console.error("errorHandler - err", err);

  if (err instanceof AppError) {
    const errors = err instanceof ValidationError ? err.errors : undefined;

    res.status(err.statusCode).json({
      message: err.message,
      errors
    })
    return;
  }

  res.status(500).json({
    message: "Something went wrong. Try again later."
  })
}