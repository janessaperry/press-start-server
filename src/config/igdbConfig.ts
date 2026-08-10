import { prisma } from "../db/client";
import { ExternalServiceError } from "../errors/AppError";
import { refreshIgdbToken } from "../jobs/refreshIgdbToken";
import { ENV } from './env.js';

export const getIgdbConfig = async () => {
  let token = await prisma.igdbToken.findFirst();

  if (!token) {
    await refreshIgdbToken();
    token = await prisma.igdbToken.findFirst();
  }

  if (!token) {
    throw new ExternalServiceError("IGDB sync failed");
  }

  return {
    baseUrl: 'https://api.igdb.com/v4',
    method: 'POST',
    headers: {
      "Client-ID": ENV.IGDB_CLIENT_ID,
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "text/plain",
    }
  }
}

export const igdbOAuthConfig = {
  url: 'https://id.twitch.tv/oauth2/token',
  method: 'POST',
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    client_id: ENV.IGDB_CLIENT_ID,
    client_secret: ENV.IGDB_CLIENT_SECRET,
    grant_type: 'client_credentials',
  }).toString(),
}