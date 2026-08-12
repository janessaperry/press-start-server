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

if (!process.env.IGDB_CLIENT_ID) {
  throw new Error('IGDB_CLIENT_ID environment variable is required');
}

if (!process.env.IGDB_CLIENT_SECRET) {
  throw new Error('IGDB_CLIENT_SECRET environment variable is required');
}

if (!process.env.RESEND_KEY) {
  throw new Error('RESEND_KEY environment variable is required');
}

if (!process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN environment variable is required');
}

if (!process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL environment variable is required');
}

export const ENV = {
  SERVER_PORT: process.env.SERVER_PORT || '8080',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:8080',
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  FRONTEND_URL: process.env.FRONTEND_URL,
  IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID,
  IGDB_CLIENT_SECRET: process.env.IGDB_CLIENT_SECRET,
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  RESEND_KEY: process.env.RESEND_KEY,
  DATABASE_URL: process.env.DATABASE_URL
};