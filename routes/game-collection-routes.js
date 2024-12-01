import express from "express";
import { authenticateToken } from "../middlewares/authenticate-token.js";
import * as gameCollectionController from "../controllers/game-collection-controller.js";

const router = express.Router();

router
	.route("/collection/page/:page")
	.post(authenticateToken, gameCollectionController.getGameCollection);

router
	.route("/collection/:gameId")
	.post(authenticateToken, gameCollectionController.addGame)
	.patch(authenticateToken, gameCollectionController.updateGame)
	.delete(authenticateToken, gameCollectionController.deleteGame);

export default router;
