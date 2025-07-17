import { Router } from "express";
import * as AuthController from "../controllers/authController.js";

const router = Router();
router
  .post("/register", AuthController.register)
  .post("/login", AuthController.login);

export default router;