const isDevelopment = process.env.NODE_ENV === 'development';

export const config = {
  apiUrl: isDevelopment 
    ? 'http://localhost:5000/api'
    : 'https://restaurant-billing-system-backend.vercel.app/api'
}; 