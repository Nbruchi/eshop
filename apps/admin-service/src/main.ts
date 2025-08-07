import express from 'express';
import dotenv from "dotenv"
import cors from "cors"
import router from "./admin.routes"
import cookieParser from "cookie-parser"
import { errorMiddleware } from '@packages/error-handler/error-middleware';

dotenv.config()

const app = express();

app.use(
  cors({
    origin: process.env.FRONTED_URL || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to admin-service!' });
});

app.use("/admin", router)

app.use(errorMiddleware)

const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
