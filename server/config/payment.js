import dotenv from 'dotenv';
dotenv.config();

export const paymentConfig = {
  stripe: {
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
    secret_key: process.env.STRIPE_SECRET_KEY
  }
}; 