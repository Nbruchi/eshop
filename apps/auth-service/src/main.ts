import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import { config } from 'dotenv';
import router from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = require('./swagger-output.json');

config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

app.use('/api', router);

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
  console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Global error handler for unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  if (reason instanceof Error && 'statusCode' in reason) {
    // Custom AppError or subclass
    const err = reason as any;
    console.error('[UnhandledRejection]', err.name, err.message, {
      statusCode: err.statusCode,
      details: err.details || undefined,
      stack: err.stack,
    });
  } else {
    console.error('[UnhandledRejection]', reason);
  }
});

process.on('uncaughtException', (err) => {
  if (err instanceof Error && 'statusCode' in err) {
    // Custom AppError or subclass
    const e = err as any;
    console.error('[UncaughtException]', e.name, e.message, {
      statusCode: e.statusCode,
      details: e.details || undefined,
      stack: e.stack,
    });
  } else {
    console.error('[UncaughtException]', err);
  }
  process.exit(1);
});
