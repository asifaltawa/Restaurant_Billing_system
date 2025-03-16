import Stripe from 'stripe';
import { paymentConfig } from '../config/payment.js';

const stripe = new Stripe(paymentConfig.stripe.secret_key, {
  apiVersion: '2023-10-16'
});

export const createStripePaymentIntent = async (amount, currency = 'usd') => {
  try {
    console.log('Creating Stripe payment intent:', { amount, currency });
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        integration_check: 'accept_a_payment',
      },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    throw error;
  }
};

export const confirmStripePayment = async (paymentIntentId) => {
  try {
    console.log('Retrieving payment intent:', paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('Payment intent status:', paymentIntent.status);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Stripe payment confirmation failed:', error);
    throw error;
  }
}; 