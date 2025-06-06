import express from 'express';
import * as path from 'path';
import cors from 'cors';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';

config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.set('trust proxy', 1); // trust first proxy

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => req.ip,
});
app.use(limiter);

app.use('/', proxy('http://localhost:6001/api'));
app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
