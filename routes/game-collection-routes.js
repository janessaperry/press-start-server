import express from "express";
import * as gameCollectionController from "../controllers/game-collection-controller.js";
const router = express.Router();

router
	.route("/collection/:userId")
	.get(gameCollectionController.getGameCollection);

router
	.route("/collection/:userId/:gameId")
	.patch(gameCollectionController.updateGame)
	.delete(gameCollectionController.deleteGame);

export default router;
