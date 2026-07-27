import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!process.env.ADMIN_API_KEY) {
  throw new Error('ADMIN_API_KEY environment variable is required');
}

export const ENV = {
  SERVER_PORT: process.env.SERVER_PORT || '8080',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:8080',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID || '',
  IGDB_CLIENT_SECRET: process.env.IGDB_CLIENT_SECRET || '',
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  RESEND_KEY: process.env.RESEND_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL
};