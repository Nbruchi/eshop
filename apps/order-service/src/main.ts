import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import router from './order.route';
import { createOrder } from './order.controller';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTED_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.post(
  '/orders/create-order',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  createOrder
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to order service!' });
});

app.use('/orders', router);

app.use(errorMiddleware);

const port = process.env.PORT || 6003;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
