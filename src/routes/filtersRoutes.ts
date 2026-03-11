import { Router } from "express";
import * as FiltersController from "../controllers/filtersController.js";

const router = Router();
router
  .get("/", FiltersController.index)

export default router;