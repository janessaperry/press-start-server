import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  SERVER_PORT: process.env.SERVER_PORT || '3000',
  CLIENT_ID: process.env.CLIENT_ID || '',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
  JWT_SECRET: process.env.JWT_SECRET || ''
};