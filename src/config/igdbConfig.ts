import { ENV } from './env.js';

export const igdbConfig = {
  baseUrl: 'https://api.igdb.com/v4',
  method: 'POST',
  headers: {
    "Client-ID": ENV.IGDB_CLIENT_ID,
    Authorization: `Bearer ${ENV.IGDB_ACCESS_TOKEN}`,
    "Content-Type": "text/plain",
  }
}