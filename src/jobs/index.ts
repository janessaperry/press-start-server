import cron from 'node-cron';
import { cleanupExpiredTokens } from "./cleanupPasswordResetTokens.js";
import { refreshIgdbToken } from "./refreshIgdbToken";

export function initializeJobs () {
  cron.schedule('0 1 * * *', cleanupExpiredTokens); //runs every night at 1am
  cron.schedule('0 1 * * 7', refreshIgdbToken); //runs every sunday at 1am
  //add igdb sync job every sunday at 2am
  console.log('Cron jobs initialized');
}
