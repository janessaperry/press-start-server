import { Router } from "express";
import * as AuthController from "../controllers/authController.js";

const router = Router();
router
  .post("/register", AuthController.register)
  .post("/login", AuthController.login)
  .post("/password-reset/request", AuthController.requestPasswordReset)
  .post("/password-reset/reset", AuthController.resetPassword);

export default router;