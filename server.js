import express from "express";
import cors from "cors";
import "dotenv/config";
import gameCollectionRoutes from "./routes/game-collection-routes.js";
const { PORT } = process.env;

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", gameCollectionRoutes);

app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
