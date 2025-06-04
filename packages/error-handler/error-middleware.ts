import { NextFunction, Request, Response } from 'express';
import { AppError } from '.';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    console.log(
      `Error ${req.method} ${req.url} - ${error.statusCode} - ${error.message}`
    );

    // Handle known application errors
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }
  console.log(`Unhandled error ${error}`);
  // Pass the error to the next error handler if any, otherwise send generic response
  return next
    ? next(error)
    : res.status(500).json({
        error: `Something went wrong! Please try again later.`,
      });
};
