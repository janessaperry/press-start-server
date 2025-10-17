import { TokenService } from "../services/tokenService.js";

export async function cleanupExpiredTokens () {
  try {
    const count = await TokenService.cleanupExpiredTokens();
    console.log(`Cleaned up ${count} expired tokens`);
  }
  catch (e) {
    console.error(( `Failed to cleanup expired tokens: ${e}` ));
  }
}
