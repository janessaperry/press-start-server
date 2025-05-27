import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  CLIENT_ID: process.env.CLIENT_ID || '',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
  PORT: process.env.PORT || '3000',
};