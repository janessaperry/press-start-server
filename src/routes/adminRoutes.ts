import { Request, Response, Router } from "express";
import { GameService } from "../services/gameService.js";
import { GenreService } from "../services/genreService.js";
import { ThemeService } from "../services/themeService.js";
import { PlatformService } from "../services/platformService.js"

const router = Router();
router.post("/igdb-sync/games", async (req: Request, res: Response) => {
  const response = await GameService.syncWithIgdb();

  res.status(200).json({
    message: "igdb sync games complete",
    response
  })
  return;
})

router.post("/igdb-sync/genres", async (req: Request, res: Response) => {
  const response = await GenreService.syncWithIgdb();
  res.status(200).json({
    message: "igdb sync genres complete",
    response
  })
  return;
})

router.post("/igdb-sync/themes", async (req: Request, res: Response) => {
  const response = await ThemeService.syncWithIgdb();
  res.status(200).json({
    message: 'igdb sync themes complete',
    response
  })
  return;
})

router.post('/igdb-sync/platforms', async (req: Request, res: Response) => {
  const response = await PlatformService.syncWithIgdb();
  res.status(200).json({
    message: "igdb sync platforms complete",
    response
  })
})

export default router;