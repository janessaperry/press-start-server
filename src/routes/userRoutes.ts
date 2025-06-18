import { Router } from "express";
import * as UserController from "../controllers/userController.js";

const router = Router();
router
  .post("/sign-up", UserController.signUp)
  .post("/log-in", UserController.logIn);

export default router;