import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import router from './chats.routes';
import { createWebSocketServer } from './websocket';
import { startConsumer } from './chat-message.consumer';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTED_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to chatting service!' });
});

app.use('/chats', router);

app.use(errorMiddleware);

const port = process.env.PORT || 6005;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

// Websocket server
createWebSocketServer(server);

// Start kafka consumer
startConsumer().catch((error) => console.log(error));

server.on('error', console.error);
