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

function toResult<T> (result: PromiseSettledResult<T>): T | { error: string } {
  if (result.status === 'fulfilled') return result.value;
  const err = result.reason;
  return { error: err instanceof Error ? err.message : 'Sync failed' };
}

export const syncAll = async (_req: Request, res: Response) => {
  const [gameTypeResult, genreResult, themeResult, platformResult, collectionResult, franchiseResult] = await Promise.allSettled([
    GameTypeService.syncWithIgdb(),
    GenreService.syncWithIgdb(),
    ThemeService.syncWithIgdb(),
    PlatformService.syncWithIgdb(),
    CollectionService.syncWithIgdb(),
    FranchiseService.syncWithIgdb(),
  ]);

  const prerequisitesFailed = [gameTypeResult, genreResult, themeResult, platformResult, collectionResult, franchiseResult]
    .some(result => result.status === 'rejected');

  let gameCounts: ProcessingCounts | { error: string };
  if (prerequisitesFailed) {
    gameCounts = { error: 'Skipped: one or more prerequisite syncs failed' };
  } else {
    try {
      gameCounts = await GameSync.syncWithIgdb();
    } catch (err) {
      gameCounts = { error: err instanceof Error ? err.message : 'Game sync failed' };
    }
  }

  let timeToBeatCounts: ProcessingCounts | { error: string };
  if ('error' in gameCounts) {
    timeToBeatCounts = { error: 'Skipped: game sync did not complete successfully' };
  } else {
    try {
      timeToBeatCounts = await TimeToBeatService.syncWithIgdb();
    } catch (err) {
      timeToBeatCounts = { error: err instanceof Error ? err.message : 'Time to beat sync failed' };
    }
  }

  const results = {
    gameTypeCounts: toResult(gameTypeResult),
    genreCounts: toResult(genreResult),
    themeCounts: toResult(themeResult),
    platformCounts: toResult(platformResult),
    collectionCounts: toResult(collectionResult),
    franchiseCounts: toResult(franchiseResult),
    gameCounts,
    timeToBeatCounts,
  };

  const hasErrors = Object.values(results).some(r => r !== null && typeof r === 'object' && 'error' in r);

  res.status(hasErrors ? 207 : 200).json({
    message: hasErrors ? "Sync completed with errors." : "Full sync complete!",
    ...results,
  });
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