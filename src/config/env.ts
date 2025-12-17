import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  SERVER_PORT: process.env.SERVER_PORT || '8080',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:8080',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID || '',
  IGDB_ACCESS_TOKEN: process.env.IGDB_ACCESS_TOKEN || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  RESEND_KEY: process.env.RESEND_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || ''
};