const Product = require('../models/product');

// Helper functions
function isValidObjectId(id) {
  return id && id.match(/^[0-9a-fA-F]{24}$/);
}

function parsePositiveInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || !Number.isInteger(number) || number <= 0) {
    return null;
  }
  return number;
}

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, stock_quantity, low_stock_threshold } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Invalid or missing name' });
    }

    if (
      stock_quantity === undefined ||
      !Number.isFinite(Number(stock_quantity)) ||
      Number(stock_quantity) < 0 ||
      !Number.isInteger(Number(stock_quantity))
    ) {
      return res.status(400).json({ error: 'Invalid stock_quantity' });
    }

    if (
      low_stock_threshold !== undefined &&
      low_stock_threshold !== null &&
      (!Number.isFinite(Number(low_stock_threshold)) ||
        Number(low_stock_threshold) < 0 ||
        !Number.isInteger(Number(low_stock_threshold)))
    ) {
      return res.status(400).json({ error: 'Invalid low_stock_threshold' });
    }

    const product = await Product.create({
      name: name.trim(),
      description: (description || '').trim(),
      stock_quantity: Number(stock_quantity),
      low_stock_threshold:
        low_stock_threshold === undefined ? 5 : Number(low_stock_threshold),
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const { name, description, stock_quantity, low_stock_threshold } = req.body;

    const update = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Invalid name' });
      }
      update.name = name.trim();
    }
    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({ error: 'Invalid description' });
      }
      update.description = description.trim();
    }
    if (stock_quantity !== undefined) {
      const sq = Number(stock_quantity);
      if (!Number.isFinite(sq) || !Number.isInteger(sq) || sq < 0) {
        return res.status(400).json({ error: 'stock_quantity must be an integer >= 0' });
      }
      update.stock_quantity = sq;
    }
    if (low_stock_threshold !== undefined) {
      if (low_stock_threshold === null) {
        update.low_stock_threshold = 5; // Default value
      } else {
        const lst = Number(low_stock_threshold);
        if (!Number.isFinite(lst) || !Number.isInteger(lst) || lst < 0) {
          return res.status(400).json({ error: 'Invalid low_stock_threshold' });
        }
        update.low_stock_threshold = lst;
      }
    }

    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Increase stock quantity
const increaseStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }
    const quantity = parsePositiveInteger(req.body && req.body.quantity);
    if (quantity === null) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    product.stock_quantity += quantity;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Decrease stock quantity
const decreaseStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }
    const quantity = parsePositiveInteger(req.body && req.body.quantity);
    if (quantity === null) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.stock_quantity - quantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    product.stock_quantity -= quantity;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get products with low stock
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      low_stock_threshold: { $ne: null },
      $expr: { $lt: ['$stock_quantity', '$low_stock_threshold'] },
    }).sort({ stock_quantity: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  increaseStock,
  decreaseStock,
  getLowStockProducts,
};
