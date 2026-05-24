import cors from 'cors';
import 'dotenv/config';
import express, { Request, Response } from 'express';

import { ENV } from "./config/env.js";
import { initializeJobs } from "./jobs";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import filtersRoutes from "./routes/filtersRoutes";
import gamesRoutes from "./routes/gamesRoutes.js";

const app = express();

app.use(express.json());
app.use(cors({origin: ENV.CORS_ORIGIN}));
app.use("/public", express.static("public"));

app.get('/', (req: Request, res: Response) => {
  res.json({message: 'Welcome to the Press Start API!'});
});

app.use("/admin", adminRoutes)
app.use("/auth", authRoutes)
app.use("/filters", filtersRoutes)
app.use("/games", gamesRoutes)
app.use("/users/:userId/collection", collectionRoutes)

app.get('/health', (req: Request, res: Response) => {
  console.log(process.env.NODE_ENV);
  res.status(200).json({status: 'OK', timestamp: new Date().toISOString()});
});

initializeJobs();

const port = ENV.SERVER_PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
