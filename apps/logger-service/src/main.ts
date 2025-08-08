import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import { WebSocket } from 'ws';
import router from './logger.routes';
import { createServer } from 'http';
import { consumeKafkaMessages } from './logger-consumer';

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
  res.send({ message: 'Welcome to log service!' });
});

app.use('/logs', router);

app.use(errorMiddleware);

const wsServer = new WebSocket.Server({ noServer: true });
export const clients = new Set<WebSocket>();

wsServer.on('connection', (ws) => {
  console.log(`New logger client connected!`);
  clients.add(ws);

  ws.on('close', () => {
    console.log('Logger client disconnected');
    clients.delete(ws);
  });
});

const port = process.env.PORT || 6006;

const server = createServer(app);

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection",ws,request)
  })
})

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  
})

// Start kafka consumer
consumeKafkaMessages()

server.on('error', console.error);
