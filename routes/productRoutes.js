// routes/productRoutes.js
const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  increaseStock,
  decreaseStock,
  getLowStockProducts,
} = require('../controllers/productController');

const router = express.Router();

// POST /products → Create a product
router.post('/', createProduct);

// GET /products/low-stock → Get products with stock below threshold (must come before /:id)
router.get('/low-stock', getLowStockProducts);

// GET /products → List all products
router.get('/', getAllProducts);

// GET /products/:id → Get a single product by ID
router.get('/:id', getProductById);

// PUT /products/:id → Update a product (cannot allow stock_quantity < 0)
router.put('/:id', updateProduct);

// DELETE /products/:id → Delete a product
router.delete('/:id', deleteProduct);

// POST /products/:id/increase-stock → Increase stock by a given quantity
router.post('/:id/increase-stock', increaseStock);

// POST /products/:id/decrease-stock → Decrease stock by a given quantity
router.post('/:id/decrease-stock', decreaseStock);

module.exports = router;