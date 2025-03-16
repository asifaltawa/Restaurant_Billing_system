import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  notes: String
});

const orderSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'preparing', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi'],
    default: 'cash'
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema); 