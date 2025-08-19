import express, { Request, Response } from 'express';
import cors from 'cors';

import 'dotenv/config';
import { ENV } from "./config/env.js";

import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: ENV.CORS_ORIGIN }));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Press Start API!' });
});

app.use("/auth", authRoutes)

app.get('/health', (req: Request, res: Response) => {
  console.log(process.env.NODE_ENV)
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const port = ENV.SERVER_PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

