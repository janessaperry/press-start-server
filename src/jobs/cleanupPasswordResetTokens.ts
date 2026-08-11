import { logger } from "../errors/logger.js";
import { TokenService } from "../services/tokenService.js";

export async function cleanupExpiredTokens () {
  try {
    const count = await TokenService.cleanupExpiredTokens();
    logger.info(`Cleaned up ${count} expired tokens`);
  }
  catch (e) {
    logger.error({ err: e }, "Failed to cleanup expired tokens");
  }
}
