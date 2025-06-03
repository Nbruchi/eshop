import { Request, Response } from 'express';
import { AppError } from '.';

export const errorMiddleware = (error: Error, req: Request, res: Response) => {
  if (error instanceof AppError) {
    console.log(
      `Error ${req.method} ${req.url} - ${error.statusCode} - ${error.message}`
    );

    // Handle known application errors
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }
  console.log(`Unhandled error ${error}`);
  return res.status(500).json({
    error: `Something went wrong! Please try again later.`,
  });
};
