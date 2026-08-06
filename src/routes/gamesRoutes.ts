import { Router } from "express";
import * as GamesController from "../controllers/gamesController.js";
import { authenticateOptionalToken } from "../middlewares/authenticateToken.js";

const router = Router();
router
  .get("/", authenticateOptionalToken, GamesController.index)
  .get("/search/:searchQuery", GamesController.search)
  .get("/:gameId", authenticateOptionalToken, GamesController.show)

export default router;