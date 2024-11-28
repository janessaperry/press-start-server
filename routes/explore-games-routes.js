import express from "express";
import * as exploreGamesController from "../controllers/explore-games-controller.js";
const router = express.Router();

router.route("/explore").get(exploreGamesController.getGames);
router
	.route("/explore/:platform/:page")
	.post(exploreGamesController.getGamesByPlatform);

export default router;
