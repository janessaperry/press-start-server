import { Request, Response } from "express";
import { runFullSync } from "../jobs/syncIgdb";
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

export const syncAll = async (_req: Request, res: Response) => {
  void runFullSync();
  res.status(202).json({ message: "Sync started." });
  return;
}

export const syncGameTypes = async (_req: Request, res: Response) => {
  const counts: ProcessingCounts = await GameTypeService.syncWithIgdb();

  res.status(200).json({
    message: "Game types synced.",
    counts
  });
  return;
}

export const syncGenres = async (_req: Request, res: Response) => {
  const counts: ProcessingCounts = await GenreService.syncWithIgdb();

  res.status(200).json({
    message: "Genres synced.",
    counts
  });
  return;
}

export const syncThemes = async (_req: Request, res: Response) => {
  const counts: ProcessingCounts = await ThemeService.syncWithIgdb();

  res.status(200).json({
    message: "Themes synced.",
    counts
  });
  return;
}

export const syncPlatforms = async (_req: Request, res: Response) => {
  const { platformFamilyCounts, platformCounts } = await PlatformService.syncWithIgdb();

  res.status(200).json({
    message: "Platforms synced.",
    platformFamilyCounts,
    platformCounts,
  });
  return;
}

export const syncCollections = async (_req: Request, res: Response) => {
  const counts: ProcessingCounts = await CollectionService.syncWithIgdb();

  res.status(200).json({
    message: "Collections synced.",
    counts
  });
  return;
}

export const syncFranchises = async (_req: Request, res: Response) => {
  const counts: ProcessingCounts = await FranchiseService.syncWithIgdb();

  res.status(200).json({
    message: "Franchises synced.",
    counts
  })
  return;
}

export const syncGames = async (_req: Request, res: Response) => {
  const counts: ProcessingCounts = await GameSync.syncWithIgdb();

  res.status(200).json({
    message: "Games synced.",
    counts
  });
  return;
}

export const syncTimeToBeat = async (_req: Request, res: Response) => {
  const counts: ProcessingCounts = await TimeToBeatService.syncWithIgdb();

  res.status(200).json({
    message: "Time to beat synced.",
    counts
  });
  return;
}