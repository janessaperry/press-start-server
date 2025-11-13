import { Request, Response, Router } from "express";
import { GameService } from "../services/gameService.js";

const router = Router();
router.post("/sync-igdb", async (req: Request, res: Response) => {
  const response = await GameService.syncWithIgdb();

  res.status(200).json({
    message: "igdb sync complete",
    response
  })
  return;
})

export default router;