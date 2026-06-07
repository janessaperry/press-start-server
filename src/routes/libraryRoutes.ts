import { Router } from "express";
import * as LibraryController from "../controllers/libraryController.js";

const router = Router({ mergeParams: true });
router
  .get("/", LibraryController.index)
  .post("/", LibraryController.create)
  .delete("/:gameId", LibraryController.remove);

export default router;
