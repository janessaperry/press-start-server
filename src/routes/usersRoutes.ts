import { Router } from "express";
import * as UsersController from "../controllers/usersController.js";

const router = Router({ mergeParams: true });
router
  .patch("/:userId/password", UsersController.updatePassword)
  .delete("/:userId", UsersController.destroy);

export default router;