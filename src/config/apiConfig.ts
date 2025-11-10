import { ENV } from './env.js';

export const apiConfig = {
  baseUrl: 'https://api.igdb.com/v4',
  method: 'POST',
  headers: {
    "Client-ID": ENV.CLIENT_ID,
    Authorization: `Bearer ${ENV.ACCESS_TOKEN}`,
    "Content-Type": "text/plain",
  }
}