# Aetheria API Testing Guide

This guide details all REST API endpoints for the Aetheria E-Commerce platform, including request payloads, header structures, and copy-pasteable `curl` commands for local verification.

---

## 🔐 1. Authentication Endpoints

These endpoints manage account registration, login sessions, and profile retrieval.

### A. Register Account
Creates a standard customer account (defaults to `role: 'user'`).
- **Endpoint**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
- **Curl Command**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jane Smith\",\"email\":\"jane@example.com\",\"password\":\"securepassword123\"}"
```

### B. Login
Authenticates and returns a secure JWT bearer token.
- **Endpoint**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
- **Curl Command**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"jane@example.com\",\"password\":\"securepassword123\"}"
```

### C. Get Current User Profile (Protected)
Retrieves the logged-in user profile using the JWT.
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Curl Command**:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📦 2. Product Catalog Endpoints

These endpoints manage categories, public catalog views, and administrative inventory changes.

### A. Get All Categories (Public)
Lists all product classifications.
- **Endpoint**: `GET /api/products/categories`
- **Curl Command**:
```bash
curl -X GET http://localhost:5000/api/products/categories
```

### B. Create Category (Admin Only)
Adds a new product classification.
- **Endpoint**: `POST /api/products/categories`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Request Body**:
```json
{
  "name": "Books",
  "description": "Educational textbooks and luxury novels"
}
```
- **Curl Command**:
```bash
curl -X POST http://localhost:5000/api/products/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d "{\"name\":\"Books\",\"description\":\"Educational textbooks and luxury novels\"}"
```

### C. Browse Products Catalog (Public)
Fetches product grids. Supports keyword search, category filtering, price bounds, sorting, and pagination.
- **Endpoint**: `GET /api/products`
- **Query Parameters**:
  - `page`: Page index (e.g. `1`)
  - `limit`: Products count per page (e.g. `9`)
  - `search`: Keyword string (e.g. `pods`)
  - `category`: Category ID string
  - `minPrice`: Price floor
  - `maxPrice`: Price ceiling
  - `sort`: Sorting options (`newest`, `price-asc`, `price-desc`, `rating`)
- **Curl Command**:
```bash
curl -X GET "http://localhost:5000/api/products?search=pods&sort=price-asc"
```

### D. Get Single Product Details (Public)
- **Endpoint**: `GET /api/products/:productId`
- **Curl Command**:
```bash
curl -X GET http://localhost:5000/api/products/PRODUCT_ID_HERE
```

### E. Create Product (Admin Only)
Creates a new catalog listing. Supports `multipart/form-data` image attachments.
- **Endpoint**: `POST /api/products`
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Body Params (FormData)**:
  - `name`: "Retro Speaker"
  - `price`: 79.99
  - `stock`: 15
  - `category`: `CATEGORY_ID_HERE`
  - `description`: "High-fidelity portable speaker"
  - `images`: (Optional file attachments)
- **Curl Command** (Without images):
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -F "name=Retro Speaker" \
  -F "price=79.99" \
  -F "stock=15" \
  -F "category=CATEGORY_ID_HERE" \
  -F "description=High-fidelity portable speaker"
```

### F. Update Product (Admin Only)
Modifies inventory parameters and appends new images.
- **Endpoint**: `PUT /api/products/:productId`
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Curl Command**:
```bash
curl -X PUT http://localhost:5000/api/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -F "price=89.99" \
  -F "stock=20"
```

### G. Delete Product (Admin Only)
- **Endpoint**: `DELETE /api/products/:productId`
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Curl Command**:
```bash
curl -X DELETE http://localhost:5000/api/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## 🛒 3. Shopping & Order Endpoints

These endpoints manage transaction pipelines.

### A. Place Order (Protected)
Submits a checkout order and deducts items from product stock.
- **Endpoint**: `POST /api/orders`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
```json
{
  "orderItems": [
    {
      "product": "PRODUCT_ID_HERE",
      "name": "Aether Pods Max",
      "qty": 1,
      "price": 299.99
    }
  ],
  "shippingAddress": {
    "street": "123 Maple St",
    "city": "Boston",
    "zip": "02108"
  },
  "totalAmount": 299.99
}
```
- **Curl Command**:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN_HERE" \
  -d "{\"orderItems\":[{\"product\":\"PRODUCT_ID_HERE\",\"name\":\"Aether Pods Max\",\"qty\":1,\"price\":299.99}],\"shippingAddress\":{\"street\":\"123 Maple St\",\"city\":\"Boston\",\"zip\":\"02108\"},\"totalAmount\":299.99}"
```

### B. Get My Orders History (Protected)
- **Endpoint**: `GET /api/orders/my`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Curl Command**:
```bash
curl -X GET http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

### C. Get All Orders (Admin Only)
- **Endpoint**: `GET /api/orders`
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Curl Command**:
```bash
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### D. Update Order Status (Admin Only)
Modifies delivery and payment stages.
- **Endpoint**: `PUT /api/orders/:orderId/status`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Request Body**:
```json
{
  "status": "shipped" 
}
```
*Note: Valid statuses are `pending`, `paid`, `shipped`, `delivered`, `cancelled`.*
- **Curl Command**:
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID_HERE/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d "{\"status\":\"shipped\"}"
```

---

## 💳 4. Checkout & Payment Endpoints

These endpoints manage transaction sessions.

### A. Initiate Checkout Session (Protected)
Triggers a Stripe Session or Mock session depending on API configurations.
- **Endpoint**: `POST /api/payments/session`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
```json
{
  "orderId": "ORDER_ID_HERE"
}
```
- **Curl Command**:
```bash
curl -X POST http://localhost:5000/api/payments/session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN_HERE" \
  -d "{\"orderId\":\"ORDER_ID_HERE\"}"
```

### B. Verify Session Transaction (Public)
Validates payment success status. Updates order status to `paid` if verification succeeds.
- **Endpoint**: `GET /api/payments/verify/:sessionId`
- **Curl Command**:
```bash
curl -X GET http://localhost:5000/api/payments/verify/SESSION_ID_HERE
```

---

## ⭐ 5. Reviews Endpoints

These endpoints manage customer reviews. Adding a review dynamically recalculates average product ratings.

### A. Add Product Review (Protected)
Submits a rating and comment for a product.
- **Endpoint**: `POST /api/products/:productId/reviews`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
```json
{
  "rating": 5,
  "comment": "Outstanding audio quality and comfortable design!"
}
```
- **Curl Command**:
```bash
curl -X POST http://localhost:5000/api/products/PRODUCT_ID_HERE/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN_HERE" \
  -d "{\"rating\":5,\"comment\":\"Outstanding audio quality and comfortable design!\"}"
```

### B. Read Product Reviews (Public)
Lists all customer reviews for a specific product.
- **Endpoint**: `GET /api/products/:productId/reviews`
- **Curl Command**:
```bash
curl -X GET http://localhost:5000/api/products/PRODUCT_ID_HERE/reviews
```

### C. Delete Review (Admin or Owner Only)
Removes a review and updates the product rating metadata.
- **Endpoint**: `DELETE /api/reviews/:reviewId`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Curl Command**:
```bash
curl -X DELETE http://localhost:5000/api/reviews/REVIEW_ID_HERE \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

---

## 👤 6. User Management Endpoints

These endpoints handle profile updates and administrative user records.

### A. Update Profile Details (Protected)
- **Endpoint**: `PUT /api/users/profile`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
```json
{
  "name": "Jane Miller",
  "email": "jane@example.com",
  "address": {
    "street": "789 Pine Rd",
    "city": "Boston",
    "zip": "02108"
  }
}
```
- **Curl Command**:
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN_HERE" \
  -d "{\"name\":\"Jane Miller\",\"email\":\"jane@example.com\",\"address\":{\"street\":\"789 Pine Rd\",\"city\":\"Boston\",\"zip\":\"02108\"}}"
```

### B. Change Password (Protected)
- **Endpoint**: `PUT /api/users/password`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
```json
{
  "currentPassword": "securepassword123",
  "newPassword": "brandnewpassword123"
}
```
- **Curl Command**:
```bash
curl -X PUT http://localhost:5000/api/users/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN_HERE" \
  -d "{\"currentPassword\":\"securepassword123\",\"newPassword\":\"brandnewpassword123\"}"
```

### C. List All User Accounts (Admin Only)
- **Endpoint**: `GET /api/users`
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Curl Command**:
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```
