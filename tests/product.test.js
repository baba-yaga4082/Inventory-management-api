const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('Product API Tests', () => {
  let testProductId;

  beforeAll(async () => {
    // Connect to test database
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory_api_test';
    await mongoose.connect(MONGODB_URI);
  });

  afterAll(async () => {
    // Clean up products and close connection
    await mongoose.connection.db.collection('products').deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up products before each test
    await mongoose.connection.db.collection('products').deleteMany({});
  });

  describe('POST /products', () => {
    it('should create a new product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        stock_quantity: 10,
        low_stock_threshold: 3
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(productData.name);
      expect(response.body.description).toBe(productData.description);
      expect(response.body.stock_quantity).toBe(productData.stock_quantity);
      expect(response.body.low_stock_threshold).toBe(productData.low_stock_threshold);

      testProductId = response.body._id;
    });

    it('should create a product with default low_stock_threshold', async () => {
      const productData = {
        name: 'Test Product 2',
        description: 'Another test product',
        stock_quantity: 5
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body.low_stock_threshold).toBe(5);
    });

    it('should return 400 for missing name', async () => {
      const productData = {
        description: 'A test product',
        stock_quantity: 10
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for negative stock_quantity', async () => {
      const productData = {
        name: 'Test Product',
        stock_quantity: -5
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      // Create test products
      const product1 = {
        name: 'Product 1',
        description: 'First product',
        stock_quantity: 10
      };
      const product2 = {
        name: 'Product 2',
        description: 'Second product',
        stock_quantity: 5
      };

      await request(app).post('/products').send(product1);
      await request(app).post('/products').send(product2);

      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a specific product', async () => {
      const productData = {
        name: 'Specific Product',
        description: 'A specific product',
        stock_quantity: 15
      };

      const createResponse = await request(app)
        .post('/products')
        .send(productData);

      const productId = createResponse.body._id;

      const response = await request(app)
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body.name).toBe(productData.name);
      expect(response.body.stock_quantity).toBe(productData.stock_quantity);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/products/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/products/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid product id');
    });
  });

  describe('PUT /products/:id', () => {
    let productId;

    beforeEach(async () => {
      const productData = {
        name: 'Original Product',
        description: 'Original description',
        stock_quantity: 10,
        low_stock_threshold: 3
      };

      const response = await request(app)
        .post('/products')
        .send(productData);

      productId = response.body._id;
    });

    it('should update a product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        description: 'Updated description',
        stock_quantity: 20
      };

      const response = await request(app)
        .put(`/products/${productId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.stock_quantity).toBe(updateData.stock_quantity);
    });

    it('should prevent negative stock_quantity', async () => {
      const updateData = {
        stock_quantity: -5
      };

      const response = await request(app)
        .put(`/products/${productId}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/products/${fakeId}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product successfully', async () => {
      const productData = {
        name: 'Product to Delete',
        stock_quantity: 5
      };

      const createResponse = await request(app)
        .post('/products')
        .send(productData);

      const productId = createResponse.body._id;

      await request(app)
        .delete(`/products/${productId}`)
        .expect(204);

      // Verify product is deleted
      await request(app)
        .get(`/products/${productId}`)
        .expect(404);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/products/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('POST /products/:id/increase-stock', () => {
    let productId;

    beforeEach(async () => {
      const productData = {
        name: 'Stock Product',
        stock_quantity: 10
      };

      const response = await request(app)
        .post('/products')
        .send(productData);

      productId = response.body._id;
    });

    it('should increase stock normally', async () => {
      const increaseData = { quantity: 5 };

      const response = await request(app)
        .post(`/products/${productId}/increase-stock`)
        .send(increaseData)
        .expect(200);

      expect(response.body.stock_quantity).toBe(15);
    });

    it('should return 400 for invalid quantity', async () => {
      const increaseData = { quantity: -5 };

      const response = await request(app)
        .post(`/products/${productId}/increase-stock`)
        .send(increaseData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for non-positive quantity', async () => {
      const increaseData = { quantity: 0 };

      const response = await request(app)
        .post(`/products/${productId}/increase-stock`)
        .send(increaseData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/products/${fakeId}/increase-stock`)
        .send({ quantity: 5 })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('POST /products/:id/decrease-stock', () => {
    let productId;

    beforeEach(async () => {
      const productData = {
        name: 'Stock Product',
        stock_quantity: 10
      };

      const response = await request(app)
        .post('/products')
        .send(productData);

      productId = response.body._id;
    });

    it('should decrease stock normally', async () => {
      const decreaseData = { quantity: 3 };

      const response = await request(app)
        .post(`/products/${productId}/decrease-stock`)
        .send(decreaseData)
        .expect(200);

      expect(response.body.stock_quantity).toBe(7);
    });

    it('should return 400 for insufficient stock', async () => {
      const decreaseData = { quantity: 15 };

      const response = await request(app)
        .post(`/products/${productId}/decrease-stock`)
        .send(decreaseData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Insufficient stock');
    });

    it('should return 400 for invalid quantity', async () => {
      const decreaseData = { quantity: -2 };

      const response = await request(app)
        .post(`/products/${productId}/decrease-stock`)
        .send(decreaseData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/products/${fakeId}/decrease-stock`)
        .send({ quantity: 5 })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('GET /products/low-stock', () => {
    it('should return products with stock below threshold', async () => {
      // Create products with different stock levels
      const lowStockProduct = {
        name: 'Low Stock Product',
        stock_quantity: 2,
        low_stock_threshold: 5
      };

      const normalStockProduct = {
        name: 'Normal Stock Product',
        stock_quantity: 10,
        low_stock_threshold: 5
      };

      await request(app).post('/products').send(lowStockProduct);
      await request(app).post('/products').send(normalStockProduct);

      const response = await request(app)
        .get('/products/low-stock')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Low Stock Product');
    });

    it('should return empty array when no products are low stock', async () => {
      const normalStockProduct = {
        name: 'Normal Stock Product',
        stock_quantity: 10,
        low_stock_threshold: 5
      };

      await request(app).post('/products').send(normalStockProduct);

      const response = await request(app)
        .get('/products/low-stock')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });
});
