import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  SERVER_PORT: process.env.SERVER_PORT || '3000',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '3000',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  RESEND_KEY: process.env.RESEND_KEY || ''
};