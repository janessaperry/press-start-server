import express from "express";
import "dotenv/config";
import * as searchGamesController from "../controllers/search-games-controller.js";

const router = express.Router();

router.route("/search").post(searchGamesController.searchGames);

export default router;
