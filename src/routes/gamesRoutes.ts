import { Router } from "express";
import * as GamesController from "../controllers/gamesController.js";

const router = Router();
router
  .get("/", GamesController.index)
  .get("/:gameId", GamesController.show)

export default router;