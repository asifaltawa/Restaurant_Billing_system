import { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Development environment check
// const isDevelopment = process.env.NODE_ENV === 'development';

// Stripe payment form component
function StripePaymentForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError('Payment system not initialized');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      console.log('Starting payment confirmation...');
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/bills`,
          payment_method_data: {
            billing_details: {
              address: {
                country: 'IN'
              }
            }
          }
        }
      });

      console.log('Payment confirmation result:', { paymentError, paymentIntent });

      if (paymentError) {
        console.error('Payment error:', paymentError);
        setError(paymentError.message || 'Payment failed');
        onError(paymentError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onSuccess(paymentIntent);
      } else {
        console.error('Payment failed:', { paymentIntent });
        setError('Payment failed. Please try again.');
        onError('Payment failed');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.message || 'An unexpected error occurred');
      onError('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <PaymentElement options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              address: {
                country: 'IN'
              }
            }
          },
          fields: {
            billingDetails: {
              address: {
                country: 'never'
              }
            }
          }
        }} />
      </div>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing Payment...
          </div>
        ) : (
          `Pay $${(amount || 0).toFixed(2)}`
        )}
      </button>
    </form>
  );
}

// Main payment modal component
function PaymentModal({ isOpen, onClose, amount, orderId, onPaymentSuccess }) {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initStripe = async () => {
      try {
        console.log('Initializing Stripe...');
        const { data } = await axios.get('https://restaurant-billing-system-backend.vercel.app/api/payments/stripe/config');
        console.log('Stripe config received:', { publishableKey: data.publishableKey?.slice(0, 8) + '...' });
        const stripe = await loadStripe(data.publishableKey);
        console.log('Stripe initialized successfully');
        setStripePromise(stripe);
      } catch (err) {
        console.error('Stripe initialization failed:', err);
        setError('Failed to initialize payment system');
      }
    };

    initStripe();
  }, []);

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!amount || amount <= 0) {
        console.log('Invalid amount, skipping payment intent creation:', amount);
        return;
      }

      try {
        console.log('Creating payment intent for amount:', amount);
        const { data } = await axios.post('https://restaurant-billing-system-backend.vercel.app/api/payments/stripe/create', {
          amount,
          orderId,
          currency: 'inr' // Set currency to INR for Indian Rupees
        });
        console.log('Payment intent created successfully:', { clientSecret: data.clientSecret?.slice(0, 8) + '...' });
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Payment intent creation failed:', err);
        setError('Failed to initialize payment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && amount > 0) {
      createPaymentIntent();
    }
  }, [isOpen, amount, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Card Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-600">Total Amount:</p>
            <p className="text-2xl font-bold text-gray-900">${(amount || 0).toFixed(2)}</p>
          </div>

          {error ? (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button 
                    onClick={() => {
                      setError('');
                      setLoading(true);
                      window.location.reload();
                    }}
                    className="mt-1 text-sm text-red-700 hover:text-red-800 font-medium underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="py-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Initializing payment...</p>
            </div>
          ) : stripePromise && clientSecret ? (
            <Elements 
              stripe={stripePromise} 
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#4f46e5',
                    colorBackground: '#ffffff',
                    colorText: '#1f2937',
                    colorDanger: '#dc2626',
                    fontFamily: 'system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px'
                  },
                  rules: {
                    '.Input': {
                      padding: '8px'
                    }
                  }
                }
              }}
            >
              <StripePaymentForm
                amount={amount}
                onSuccess={onPaymentSuccess}
                onError={setError}
              />
            </Elements>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal; 