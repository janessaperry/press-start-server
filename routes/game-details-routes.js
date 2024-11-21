import express from "express";
import "dotenv/config";
import * as gameDetailsController from "../controllers/game-details-controller.js";

const router = express.Router();

router.route("/game-details/:gameId").get(gameDetailsController.getGameDetails);

export default router;
