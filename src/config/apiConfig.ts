import { ENV } from './env.js';

export const apiConfig = {
  baseUrl: 'UPDATE',
  method: 'POST',
  headers: {
    "Client-ID": ENV.CLIENT_ID,
    Authorization: ENV.ACCESS_TOKEN,
    "Content-Type": "application/json",
  }
}