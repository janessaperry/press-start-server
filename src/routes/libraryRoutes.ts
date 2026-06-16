import { Router } from "express";
import * as LibraryController from "../controllers/libraryController.js";

const router = Router({ mergeParams: true });
router
  .get("/", LibraryController.index)
  .get("/:gameId", LibraryController.show)
  .post("/", LibraryController.create)
  .patch("/", LibraryController.update)
  .delete("/:gameId", LibraryController.remove);

export default router;
