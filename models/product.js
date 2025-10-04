// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'stock_quantity must be an integer',
      },
      default: 0,
    },
    low_stock_threshold: {
      type: Number,
      min: [0, 'Low stock threshold cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'low_stock_threshold must be an integer',
      },
      default: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);