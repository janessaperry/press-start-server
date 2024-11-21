import express from "express";
import cors from "cors";
import "dotenv/config";
import gameCollectionRoutes from "./routes/game-collection-routes.js";
import gameDetailsRoutes from "./routes/game-details-routes.js";
const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", gameCollectionRoutes);
app.use("/api", gameDetailsRoutes);

app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
