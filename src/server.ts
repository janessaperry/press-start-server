import cors from 'cors';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import pinoHttp from 'pino-http';

import { ENV } from "./config/env.js";
import { logger } from "./errors/logger";
import { initializeJobs } from "./jobs";
import { authenticateToken } from "./middlewares/authenticateToken";
import { errorHandler } from "./middlewares/errorHandler";
import { adminLimiter, authLimiter, generousLimiter, libraryLimiter, usersLimiter } from "./middlewares/rateLimiter";
import { requireAdminKey } from "./middlewares/requireAdminKey";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import filtersRoutes from "./routes/filtersRoutes";
import gamesRoutes from "./routes/gamesRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

const app = express();

app.use(pinoHttp({
  logger,
  autoLogging: false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: ENV.CORS_ORIGIN,
  exposedHeaders: ['Retry-After', 'RateLimit', 'RateLimit-Policy']
}));
app.use(express.static("public"));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Press Start API!' });
});

app.use("/admin", adminLimiter, requireAdminKey, adminRoutes)
app.use("/auth", authLimiter, authRoutes)
app.use("/filters", generousLimiter, filtersRoutes)
app.use("/games", generousLimiter, gamesRoutes)
app.use("/users/:userId/account", usersLimiter, authenticateToken, usersRoutes)
app.use("/users/:userId/library", libraryLimiter, authenticateToken, libraryRoutes)

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" })
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.too.large') {
    logger.warn({ url: req.url }, 'Payload too large');
    return res.status(413).json({ message: 'Payload too large' });
  }
  next(err);
});

app.use(errorHandler);

initializeJobs();

const port = ENV.SERVER_PORT || 3000;
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
