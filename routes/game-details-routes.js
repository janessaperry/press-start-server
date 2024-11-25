import express from "express";
import "dotenv/config";
import * as gameDetailsController from "../controllers/game-details-controller.js";

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
	.route("/game-details/:gameId")
	.get(authenticateToken, gameDetailsController.getGameDetails);

export default router;
