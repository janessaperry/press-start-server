import cron from 'node-cron';
import { logger } from "../errors/logger";
import { cleanupExpiredTokens } from "./cleanupPasswordResetTokens.js";
import { refreshIgdbToken } from "./refreshIgdbToken";
import { runFullSync } from "./syncIgdb";

export function initializeJobs () {
  cron.schedule('0 1 * * *', cleanupExpiredTokens);  // every night at 1am
  cron.schedule('0 1 * * 7', refreshIgdbToken);      // every sunday at 1am
  cron.schedule('0 2 * * 7', runFullSync);           // every sunday at 2am
  logger.info('Cron jobs initialized');
}
