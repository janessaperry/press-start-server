import cron from 'node-cron';
import { cleanupExpiredTokens } from "./cleanupPasswordResetTokens.js";

export function initializeJobs () {
  cron.schedule('0 2 * * *', cleanupExpiredTokens); //runs every night at 2am
  console.log('Cron jobs initialized');
}
