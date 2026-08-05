import { Router } from "express";
import * as UsersController from "../controllers/usersController.js";

const router = Router({ mergeParams: true });
router
  .patch("/password", UsersController.updatePassword)
  .delete("/", UsersController.destroy);

export default router;