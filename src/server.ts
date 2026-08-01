import cors from 'cors';
import 'dotenv/config';
import express, { Request, Response } from 'express';
import pinoHttp from 'pino-http';

import { ENV } from "./config/env.js";
import { logger } from "./errors/logger";
import { initializeJobs } from "./jobs";
import { authenticateToken } from "./middlewares/authenticateToken";
import { errorHandler } from "./middlewares/errorHandler";
import { adminLimiter, authLimiter } from "./middlewares/rateLimiter";
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
app.use(express.json());
app.use(cors({ origin: ENV.CORS_ORIGIN }));
app.use(express.static("public"));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Press Start API!' });
});

app.use("/admin", adminLimiter, requireAdminKey, adminRoutes)
app.use("/auth", authLimiter, authRoutes)
app.use("/filters", filtersRoutes)
app.use("/games", gamesRoutes)
app.use("/users", authenticateToken, usersRoutes)
app.use("/users/:userId/library", authenticateToken, libraryRoutes)

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" })
})

app.use(errorHandler);

initializeJobs();

const port = ENV.SERVER_PORT || 3000;
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
