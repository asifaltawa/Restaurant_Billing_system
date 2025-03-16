# Restaurant Billing System

A full-stack restaurant billing system built with the MERN stack (MongoDB, Express.js, React, Node.js) and Tailwind CSS.

## Features

- Menu Management

  - Add, edit, and delete menu items
  - Categorize items (appetizers, main course, desserts, beverages)
  - Set prices and descriptions

- Order Management

  - Create new orders with table numbers
  - Add multiple items to orders
  - Track order status (pending, preparing, served, completed)
  - Real-time order updates

- Billing System

  - Generate bills for orders
  - Calculate subtotal, tax, and total
  - Multiple payment methods (Cash, Card, UPI)
  - Print bills

- Reports
  - Daily sales reports
  - Payment method breakdown
  - Order statistics

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd restaurant-billing-system
   ```

2. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:

   ```bash
   cd ../client
   npm install
   ```

4. Set up environment variables:

   - Create a `.env` file in the server directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/restaurant-billing
     NODE_ENV=development
     ```

5. Start MongoDB:

   - Make sure MongoDB is running on your system
   - The default connection URL is: mongodb://localhost:27017/restaurant-billing

6. Start the server:

   ```bash
   cd server
   npm start
   ```

7. Start the client:

   ```bash
   cd client
   npm run dev
   ```

8. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Menu

- GET /api/menu - Get all menu items
- POST /api/menu - Create a new menu item
- PATCH /api/menu/:id - Update a menu item
- DELETE /api/menu/:id - Delete a menu item

### Orders

- GET /api/orders - Get all orders
- POST /api/orders - Create a new order
- PATCH /api/orders/:id/status - Update order status
- PATCH /api/orders/:id/payment - Update payment status

### Bills

- GET /api/bills/order/:orderId - Generate bill for an order
- GET /api/bills/daily-report - Get daily sales report

## Technologies Used

- Frontend:

  - React
  - Tailwind CSS
  - Axios
  - React Router

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
