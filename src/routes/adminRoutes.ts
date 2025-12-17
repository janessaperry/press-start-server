import { Router } from "express";
import * as AdminController from "../controllers/adminController.js"

const router = Router();
router
  .post("/igdb-sync/game-types", AdminController.syncGameTypes)
  .post("/igdb-sync/genres", AdminController.syncGenres)
  .post("/igdb-sync/themes", AdminController.syncThemes)
  .post("/igdb-sync/platforms", AdminController.syncPlatforms)
  .post("/igdb-sync/games", AdminController.syncGames)
  .post("/igdb-sync/all", AdminController.syncAll);

export default router;