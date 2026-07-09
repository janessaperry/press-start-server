import cors from 'cors';
import 'dotenv/config';
import express, { Request, Response } from 'express';

import { ENV } from "./config/env.js";
import { initializeJobs } from "./jobs";
import { errorHandler } from "./middlewares/errorHandler";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import filtersRoutes from "./routes/filtersRoutes";
import gamesRoutes from "./routes/gamesRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: ENV.CORS_ORIGIN }));
app.use("/public", express.static("public"));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Press Start API!' });
});

app.use("/admin", adminRoutes)
app.use("/auth", authRoutes)
app.use("/filters", filtersRoutes)
app.use("/games", gamesRoutes)
app.use("/users", usersRoutes)
app.use("/users/:userId/library", libraryRoutes)

app.get('/health', (req: Request, res: Response) => {
  console.log(process.env.NODE_ENV);
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" })
})

app.use(errorHandler);

initializeJobs();

const port = ENV.SERVER_PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
