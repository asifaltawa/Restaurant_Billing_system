import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['appetizer', 'main', 'dessert', 'beverage']
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('MenuItem', menuItemSchema); 