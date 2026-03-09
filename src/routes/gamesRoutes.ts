import { Router } from "express";
import * as GamesController from "../controllers/gamesController.js";

const router = Router();
router
  .get("/", GamesController.index)
  .get("/search/:searchQuery", GamesController.search)
  .get("/:gameId", GamesController.show)

export default router;