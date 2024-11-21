import express from "express";
import * as usersController from "../controllers/users-controller.js";

const router = express.Router();

router.route("/users").get(usersController.getUser);

export default router;
