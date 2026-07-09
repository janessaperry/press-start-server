export class AppError extends Error {
  statusCode: number;

  constructor (message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  errors?: Record<string, string | undefined>;

  constructor (message: string, errors?: Record<string, string | undefined>) {
    super(message, 400);
    this.errors = errors;
  }
}

export class RateLimitingError extends AppError {
  retryAfter: number;

  constructor (message: string, retryAfter: number) {
    super(message, 429);
    this.retryAfter = retryAfter
  }
}