# Inventory Management API

A Node.js + Express + MongoDB backend API for warehouse product tracking.

## Features

### Core Features
- **Product Management**: Full CRUD operations for products
- **Inventory Logic**: Stock quantity tracking with validation
- **Stock Operations**: Increase/decrease stock with proper error handling
- **Low Stock Alerts**: Track products below threshold

### Product Schema
Each product includes:
- `name` (string, required)
- `description` (string, optional)
- `stock_quantity` (integer, default: 0, min: 0)
- `low_stock_threshold` (integer, default: 5, min: 0)

## API Endpoints

### Products
- `POST /products` - Create a new product
- `GET /products` - Get all products
- `GET /products/:id` - Get a specific product
- `PUT /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

### Stock Operations
- `POST /products/:id/increase-stock` - Increase stock quantity
- `POST /products/:id/decrease-stock` - Decrease stock quantity

### Low Stock
- `GET /products/low-stock` - Get products below threshold

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env file
MONGODB_URI=mongodb://127.0.0.1:27017/inventory_api
PORT=3000
```

3. Start the server:
```bash
npm start
```

## Testing

Run the test suite:
```bash
npm test
```

The tests cover:
- CRUD operations
- Stock increase/decrease operations
- Error handling for insufficient stock
- Validation of input data
- Low stock functionality

## Example Usage

### Create a Product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Widget A",
    "description": "A useful widget",
    "stock_quantity": 10,
    "low_stock_threshold": 3
  }'
```

### Increase Stock
```bash
curl -X POST http://localhost:3000/products/{product_id}/increase-stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

### Decrease Stock
```bash
curl -X POST http://localhost:3000/products/{product_id}/decrease-stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

### Get Low Stock Products
```bash
curl http://localhost:3000/products/low-stock
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (for deletions)
- `400` - Bad Request (validation errors, insufficient stock)
- `404` - Not Found
- `500` - Internal Server Error

## Project Structure

```
├── app.js                 # Express app configuration
├── index.js              # Server entry point
├── models/
│   └── product.js        # Mongoose schema
├── controllers/
│   └── productController.js  # Business logic
├── routes/
│   └── productRoutes.js     # API routes
├── tests/
│   └── product.test.js     # Unit tests
└── package.json
```

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
