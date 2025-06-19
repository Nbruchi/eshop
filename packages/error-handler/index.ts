export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Capture the stack trace.
    Error.captureStackTrace(this);
  }
}

// Not Found Error
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// Validation Error
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, true, details);
  }
}

// Authentication Error
export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

// Forbidden Error
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
  }
}

// Database Error
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', details?: any) {
    super(message, 500, true, details);
  }
}

// Rate Limit Error
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests, please try again later') {
    super(message, 429);
  }
}
