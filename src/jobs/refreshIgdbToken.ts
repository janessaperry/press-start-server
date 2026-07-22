import "dotenv/config";
import { prisma } from "../db/client";
import { IgdbClient } from "../integrations/igdbClient";

export const refreshIgdbToken = async () => {
  try {
    const existingToken = await prisma.igdbToken.findFirst();
    if (!existingToken) {
      const newToken = await IgdbClient.generateToken();
      await prisma.igdbToken.create({
        data: {
          accessToken: newToken.access_token,
          expiresIn: newToken.expires_in
        }
      })
    } else {
      const updatedAtMs = existingToken.updatedAt.getTime();
      const elapsedMs = Date.now() - updatedAtMs;
      const expiresInMs = existingToken.expiresIn * 1000;

      const thresholdMs = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      const timeUntilExpiry = expiresInMs - elapsedMs;

      if (timeUntilExpiry < thresholdMs) {
        const newToken = await IgdbClient.generateToken();
        await prisma.igdbToken.update({
          where: {
            id: existingToken.id
          },
          data: {
            accessToken: newToken.access_token,
            expiresIn: newToken.expires_in
          }
        })
      }
    }

  } catch (e) {
    console.error("IGDB token refresh failed:", e);
  }
}