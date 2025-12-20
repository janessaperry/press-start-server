import { Request, Response } from "express";
import { GameTypeService } from "../services/gameTypeService.js";
import { GenreService } from "../services/genreService.js";
import { ThemeService } from "../services/themeService.js";
import { PlatformService } from "../services/platformService";
import { GameSync } from "../services/game/gameSync";

export type ProcessingCounts = {
  updated: number,
  created: number,
  totalProcessed: number,
}

export const syncAll = async (req: Request, res: Response) => {
  const [gameTypeCounts, genreCounts, themeCounts, consoleCounts] = await Promise.all([
    GameTypeService.syncWithIgdb(),
    GenreService.syncWithIgdb(),
    ThemeService.syncWithIgdb(),
    PlatformService.syncWithIgdb(),
  ]);

  const gameCounts: ProcessingCounts = await GameSync.syncWithIgdb();

  res.status(200).json({
    message: "Full sync complete!",
    gameTypeCounts,
    genreCounts,
    themeCounts,
    consoleCounts,
    gameCounts
  })
  return;
}

export const syncGameTypes = async (req: Request, res: Response) => {
  const counts: ProcessingCounts = await GameTypeService.syncWithIgdb();

  res.status(200).json({
    message: "Game types synced.",
    counts
  });
  return;
}

export const syncGenres = async (req: Request, res: Response) => {
  const counts: ProcessingCounts = await GenreService.syncWithIgdb();

  res.status(200).json({
    message: "Genres synced.",
    counts
  });
  return;
}

export const syncThemes = async (req: Request, res: Response) => {
  const counts: ProcessingCounts = await ThemeService.syncWithIgdb();

  res.status(200).json({
    message: "Themes synced.",
    counts
  });
  return;
}

export const syncPlatforms = async (req: Request, res: Response) => {
  const {platformFamilyCounts, platformCounts} = await PlatformService.syncWithIgdb();

  res.status(200).json({
    message: "Platforms synced.",
    platformFamilyCounts,
    platformCounts,
  });
  return;
}

export const syncGames = async (req: Request, res: Response) => {
  const counts: ProcessingCounts = await GameSync.syncWithIgdb();

  res.status(200).json({
    message: "Games synced.",
    counts
  });
  return;
}