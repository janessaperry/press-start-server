import express, { json } from "express";
import cors from "cors";
import "dotenv/config";

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());

app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
