import { Request, Response } from "express";
import { CollectionService } from "../services/collectionService";
import { FranchiseService } from "../services/franchiseService";
import { GameSync } from "../services/game/gameSync";
import { GameTypeService } from "../services/gameTypeService.js";
import { GenreService } from "../services/genreService.js";
import { PlatformService } from "../services/platformService";
import { ThemeService } from "../services/themeService.js";
import { TimeToBeatService } from "../services/timeToBeatService";

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
    CollectionService.syncWithIgdb(),
  ]);

  const gameCounts: ProcessingCounts = await GameSync.syncWithIgdb();
  const timeToBeatCounts: ProcessingCounts = await TimeToBeatService.syncWithIgdb();

  res.status(200).json({
    message: "Full sync complete!",
    gameTypeCounts,
    genreCounts,
    themeCounts,
    consoleCounts,
    gameCounts,
    timeToBeatCounts
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

export const syncCollections = async (req: Request, res: Response) => {
  const counts: ProcessingCounts = await CollectionService.syncWithIgdb();

  res.status(200).json({
    message: "Collections synced.",
    counts
  });
  return;
}

export const syncFranchises = async (req: Request, res: Response) => {
  const counts: ProcessingCounts = await FranchiseService.syncWithIgdb();

  res.status(200).json({
    message: "Franchises synced.",
    counts
  })
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

export const syncTimeToBeat = async (req: Request, res: Response) => {
  const counts: ProcessingCounts = await TimeToBeatService.syncWithIgdb();

  res.status(200).json({
    message: "Time to beat synced.",
    counts
  });
  return;
}