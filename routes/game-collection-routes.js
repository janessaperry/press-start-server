import express from "express";
import * as gameCollectionController from "../controllers/game-collection-controller.js";
const router = express.Router();

function authenticateToken(req, res, next) {
	const token = req.headers.authorization.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "No access token provided" });
	}

	if (token === "mock-access-token") {
		req.userId = 1;
		return next();
	}

	return res.status(498).json({ message: "Invalid access token" });
}

router
	.route("/collection")
	.get(authenticateToken, gameCollectionController.getGameCollection);

router
	.route("/collection/:gameId")
	.post(authenticateToken, gameCollectionController.addGame)
	.patch(authenticateToken, gameCollectionController.updateGame)
	.delete(authenticateToken, gameCollectionController.deleteGame);

export default router;
