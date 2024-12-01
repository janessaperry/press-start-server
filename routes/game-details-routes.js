import express from "express";
import "dotenv/config";
import { authenticateToken } from "../middlewares/authenticate-token.js";
import * as gameDetailsController from "../controllers/game-details-controller.js";

const router = express.Router();

router
	.route("/game-details/:gameId")
	.get(authenticateToken, gameDetailsController.getGameDetails);

export default router;
