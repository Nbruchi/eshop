import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import { config } from 'dotenv';
import router from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

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

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to auth-service!' });
});

app.use('/api/auth', router);
app.use(
  '/swagger-custom.css',
  express.static(path.join(__dirname, 'swagger-custom.css'))
);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCssUrl: '/swagger-custom.css',
  })
);
app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
});
server.on('error', console.error);
