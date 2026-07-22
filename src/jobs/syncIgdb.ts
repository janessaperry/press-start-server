import { logger } from "../errors/logger";
import { EmailService } from "../integrations/emailService";
import { CollectionService } from "../services/collectionService";
import { FranchiseService } from "../services/franchiseService";
import { GameSync } from "../services/game/gameSync";
import { GameTypeService } from "../services/gameTypeService";
import { GenreService } from "../services/genreService";
import { PlatformService } from "../services/platformService";
import { ThemeService } from "../services/themeService";
import { TimeToBeatService } from "../services/timeToBeatService";

export async function runFullSync () {
  logger.info("Starting full IGDB sync...");

  const failedStages: string[] = [];

  const [gameTypeResult, genreResult, themeResult, platformResult, collectionResult, franchiseResult] = await Promise.allSettled([
    GameTypeService.syncWithIgdb(),
    GenreService.syncWithIgdb(),
    ThemeService.syncWithIgdb(),
    PlatformService.syncWithIgdb(),
    CollectionService.syncWithIgdb(),
    FranchiseService.syncWithIgdb(),
  ]);

  const prerequisiteResults = { gameTypeResult, genreResult, themeResult, platformResult, collectionResult, franchiseResult };

  for (const [name, result] of Object.entries(prerequisiteResults)) {
    if (result.status === 'fulfilled') {
      logger.info({ counts: result.value }, `${name} complete`);
    } else {
      logger.error({ err: result.reason }, `${name} failed`);
      failedStages.push(name);
    }
  }

  if (failedStages.length > 0) {
    failedStages.push("Game sync (skipped: prerequisite sync failed)");
    failedStages.push("Time to beat sync (skipped: game sync did not run)");
    await EmailService.sendSyncFailureEmail(failedStages);
    return;
  }

  let gameSyncFailed = false;
  try {
    const gameCounts = await GameSync.syncWithIgdb();
    logger.info({ counts: gameCounts }, "Game sync complete");
  } catch (err) {
    logger.error({ err }, "Game sync failed");
    failedStages.push("Game sync");
    gameSyncFailed = true;
  }

  if (gameSyncFailed) {
    failedStages.push("Time to beat sync (skipped: game sync failed)");
    await EmailService.sendSyncFailureEmail(failedStages);
    return;
  }

  try {
    const timeToBeatCounts = await TimeToBeatService.syncWithIgdb();
    logger.info({ counts: timeToBeatCounts }, "Time to beat sync complete");
  } catch (err) {
    logger.error({ err }, "Time to beat sync failed");
    failedStages.push("Time to beat sync");
  }

  if (failedStages.length > 0) {
    await EmailService.sendSyncFailureEmail(failedStages);
    return;
  }

  logger.info("Full IGDB sync complete");
}