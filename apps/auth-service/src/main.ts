import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import { config } from 'dotenv';
import router from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';
import prisma from 'packages/libs/prisma';
import redis from 'packages/libs/redis';
import { createTransport } from 'nodemailer';

const swaggerDocument = require('./swagger-output.json');

config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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

  app.use('/api', router);
});

app.use(errorMiddleware);

async function checkMongoDB() {
  try {
    await prisma.$connect();
    console.log('✅ MongoDB (Prisma) connected');
    return true;
  } catch (err) {
    console.error('❌ MongoDB (Prisma) connection failed:', err);
    return false;
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    console.log('✅ Redis connected');
    return true;
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    return false;
  }
}

async function checkNodemailer() {
  try {
    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    console.log('✅ Nodemailer (SMTP) ready');
    return true;
  } catch (err) {
    console.error('❌ Nodemailer (SMTP) failed:', err);
    return false;
  }
}

async function startServer() {
  const [mongoOk, redisOk, mailOk] = await Promise.all([
    checkMongoDB(),
    checkRedis(),
    checkNodemailer(),
  ]);
  if (!mongoOk || !redisOk || !mailOk) {
    console.error('Startup aborted: One or more services failed to connect.');
    process.exit(1);
  }
  const port = process.env.PORT || 6001;
  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
    console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
  });
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

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

startServer();
