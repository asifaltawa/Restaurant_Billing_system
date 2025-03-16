import express from 'express';
import Stripe from 'stripe';
import { paymentConfig } from '../config/payment.js';

const router = express.Router();
const stripe = new Stripe(paymentConfig.stripe.secret_key);

// Get Stripe configuration
router.get('/stripe/config', (req, res) => {
  try {
    console.log('Sending Stripe config...');
    res.json({
      publishableKey: paymentConfig.stripe.publishable_key
    });
  } catch (error) {
    console.error('Error getting Stripe config:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create payment intent
router.post('/stripe/create', async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;

    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ message: 'Invalid amount' });
    }

    console.log('Creating payment intent:', { amount, currency });

    // Convert amount to smallest currency unit (paise for INR)
    const amountInSmallestUnit = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        integration_check: 'accept_a_payment',
      }
    });

    console.log('Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: error.message,
      type: error.type,
      code: error.code 
    });
  }
});

// Confirm payment
router.post('/stripe/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    console.log('Retrieving payment intent:', paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('Payment intent status:', paymentIntent.status);
    
    if (paymentIntent.status === 'succeeded') {
      res.json({ success: true });
    } else {
      res.status(400).json({ 
        message: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      message: error.message,
      type: error.type,
      code: error.code 
    });
  }
});

export default router; 