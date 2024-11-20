import express from "express";
import * as gameCollectionController from "../controllers/game-collection-controller.js";
const router = express.Router();

router
	.route("/collection/:userId")
	.get(gameCollectionController.getGameCollection);

export default router;
