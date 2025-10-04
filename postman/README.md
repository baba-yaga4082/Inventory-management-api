# Postman Testing Guide

This directory contains Postman collection and environment files for testing the Inventory Management API.

## Files

- `Inventory_API_Collection.json` - Complete API collection with all endpoints
- `Inventory_API_Environment.json` - Environment variables for testing
- `README.md` - This guide

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `Inventory_API_Collection.json`
   - `Inventory_API_Environment.json`
4. Click **Import**

### 2. Set Environment

1. In Postman, select the **Inventory API Environment** from the environment dropdown
2. Ensure the `base_url` is set to `http://localhost:3000` (or your server URL)

### 3. Start Your API Server

```bash
npm start
```

Your API should be running on `http://localhost:3000`

## Collection Structure

### Health Check
- **GET /** - Check if API is running

### Products (CRUD Operations)
- **POST /products** - Create new product
- **GET /products** - Get all products
- **GET /products/:id** - Get specific product
- **PUT /products/:id** - Update product
- **DELETE /products/:id** - Delete product

### Stock Operations
- **POST /products/:id/increase-stock** - Increase stock quantity
- **POST /products/:id/decrease-stock** - Decrease stock quantity

### Low Stock
- **GET /products/low-stock** - Get products below threshold

### Test Scenarios
- **Complete Workflow Test** - End-to-end testing sequence

## Testing Workflow

### Quick Start
1. Run **Health Check** to verify API is running
2. Create a product using **Create Product**
3. Copy the `_id` from the response
4. Set the `product_id` environment variable with this ID
5. Test other operations using the `{{product_id}}` variable

### Complete Workflow Test
The collection includes a **Complete Workflow Test** folder that demonstrates:
1. Creating a product
2. Checking initial stock
3. Increasing stock
4. Decreasing stock
5. Creating low stock situation
6. Checking low stock endpoint
7. Updating product
8. Cleaning up by deleting product

### Manual Testing Steps

1. **Create Product**:
   ```json
   {
     "name": "Test Widget",
     "description": "A test product",
     "stock_quantity": 50,
     "low_stock_threshold": 10
   }
   ```

2. **Copy Product ID** from response and set `product_id` variable

3. **Test Stock Operations**:
   - Increase stock by 25
   - Decrease stock by 10
   - Try to decrease by 1000 (should fail with insufficient stock)

4. **Test Low Stock**:
   - Decrease stock below threshold
   - Check `/products/low-stock` endpoint

## Environment Variables

- `base_url` - API base URL (default: http://localhost:3000)
- `product_id` - Current product ID for testing
- `test_product_id` - Additional product ID for complex scenarios

## Expected Responses

### Success Responses
- **201** - Product created
- **200** - Successful GET/PUT operations
- **204** - Successful DELETE (no content)

### Error Responses
- **400** - Bad Request (validation errors, insufficient stock)
- **404** - Not Found (product doesn't exist)
- **500** - Internal Server Error

### Sample Error Response
```json
{
  "error": "Insufficient stock"
}
```

## Tips for Testing

1. **Use Environment Variables**: Always use `{{product_id}}` instead of hardcoding IDs
2. **Test Edge Cases**: Try negative numbers, zero values, and invalid IDs
3. **Check Validation**: Test with missing required fields
4. **Monitor Stock**: Use the low stock endpoint to verify threshold logic
5. **Clean Up**: Delete test products after testing

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure API server is running on correct port
2. **Invalid Product ID**: Make sure to set `product_id` environment variable
3. **404 Errors**: Verify product exists before testing operations
4. **Validation Errors**: Check request body format and required fields

### Debug Steps

1. Check server logs for detailed error messages
2. Verify request body format matches API expectations
3. Ensure environment variables are set correctly
4. Test with simple requests first (Health Check, Get All Products)

## Collection Features

- **Organized by Functionality**: Requests grouped by purpose
- **Comprehensive Coverage**: All API endpoints included
- **Error Testing**: Invalid requests included for validation testing
- **Workflow Testing**: Complete end-to-end scenarios
- **Environment Variables**: Easy configuration and reuse
- **Descriptions**: Each request includes helpful descriptions

## Additional Resources

- Check the main project README.md for API documentation
- Run `npm test` to verify API functionality with unit tests
- Use Postman Console to debug request/response details
