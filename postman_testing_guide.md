# Postman API Testing Guide | Aetheria E-Commerce

This guide explains how to import, configure, and test the Aetheria e-commerce API endpoints using **Postman**.

---

## ⚙️ 1. Global Setup (Base URL Environment)
To avoid re-typing the host address for every endpoint, configure a Postman Environment:

1. Click on **Environments** on the left sidebar in Postman.
2. Click the **+** (Create Environment) icon and name it `Aetheria Local`.
3. Add a new variable:
   - **Variable**: `baseUrl`
   - **Type**: `default`
   - **Initial Value**: `http://localhost:5000`
4. Click **Save** in the top right.
5. In the top-right corner environment selector dropdown, select `Aetheria Local` to make it active.
6. You can now use the `{{baseUrl}}` variable in all request URLs (e.g., `{{baseUrl}}/api/auth/login`).

---

## 🔐 2. Authentication & User Sessions
These endpoints manage account security. Testing here returns the JWT token required for subsequent requests.

### A. Register Account (`POST /api/auth/register`)
- **URL**: `{{baseUrl}}/api/auth/register`
- **Method**: `POST`
- **Body**: Select **raw** -> change type dropdown to **JSON**
- **Payload**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
- **Action**: Click **Send**. Copy the `"token"` value from the JSON response.

### B. Account Login (`POST /api/auth/login`)
- **URL**: `{{baseUrl}}/api/auth/login`
- **Method**: `POST`
- **Body**: Select **raw** -> **JSON**
- **Payload**:
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
- **Action**: Click **Send**. Copy the `"token"` value from the response.

---

## 🔑 3. Attaching the JWT Token to Protected Requests
For endpoints requiring authentication (like getting user details or placing an order):

1. Open the protected request tab.
2. Click on the **Authorization** tab (located right under the URL bar).
3. Under the **Type** dropdown, select **Bearer Token**.
4. Paste the copied token string into the **Token** field on the right.
5. Click **Send**. Postman automatically injects the `Authorization: Bearer <TOKEN>` header.

*Protected Endpoints to verify this with:*
- `GET {{baseUrl}}/api/auth/me` (Profile details retrieval)
- `PUT {{baseUrl}}/api/users/profile` (Update name/address)

---

## 📦 4. Testing Product Uploads (Form-Data File Attachments)
Because product creations/updates use `Multer` to support binary image uploads, you must use `form-data` instead of JSON.

- **URL**: `{{baseUrl}}/api/products`
- **Method**: `POST`
- **Authorization**: Select **Bearer Token** -> paste the **Admin JWT Token** (obtain by logging in as `admin@example.com` / `admin123`).
- **Body**: Select **form-data**
- **Key-Value Grid**:
  
  | Key | Type | Value | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | `text` | `Retro Bluetooth Speaker` | Product Title |
  | `price` | `text` | `89.99` | Product Price |
  | `stock` | `text` | `20` | Stock Count |
  | `category` | `text` | `PASTE_CATEGORY_ID_HERE` | MongoDB Category ObjectId |
  | `description`| `text` | `Rich 360-degree sound with a stylish vintage leather handle.` | Product Description |
  | `images` | `file` | *Click 'Select Files' and choose an image* | **Hover key, change text dropdown to File** |

- **Action**: Click **Send**. The response will return the newly created product details and image paths.

---

## 🛒 5. E-Commerce Order & Payments Flow

### Step A: Place the Order (`POST /api/orders`)
- **URL**: `{{baseUrl}}/api/orders`
- **Method**: `POST`
- **Authorization**: Select **Bearer Token** -> paste the **Customer Token** (`user@example.com`).
- **Body**: Select **raw** -> **JSON**
- **Payload**:
```json
{
  "orderItems": [
    {
      "product": "PASTE_PRODUCT_ID_HERE",
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
- **Action**: Click **Send**. Copy the `"_id"` field value (Order ID) from the response.

### Step B: Create Payment Session (`POST /api/payments/session`)
- **URL**: `{{baseUrl}}/api/payments/session`
- **Method**: `POST`
- **Authorization**: Select **Bearer Token** -> paste the **Customer Token**.
- **Body**: Select **raw** -> **JSON**
- **Payload**:
```json
{
  "orderId": "PASTE_ORDER_ID_HERE"
}
```
- **Action**: Click **Send**. Copy the session ID (e.g., `mock_session_...` or Stripe ID) from the response.

### Step C: Verify Payment Callback (`GET /api/payments/verify/:sessionId`)
Simulates the webhook/redirection callback.
- **URL**: `{{baseUrl}}/api/payments/verify/PASTE_SESSION_ID_HERE`
- **Method**: `GET`
- **Action**: Click **Send**. Returns verification status success and updates order status to `"paid"` in the database.

---

## ⭐ 6. Product Reviews & Rating Recalculations

### A. Post Product Review (`POST /api/products/:id/reviews`)
- **URL**: `{{baseUrl}}/api/products/PASTE_PRODUCT_ID_HERE/reviews`
- **Method**: `POST`
- **Authorization**: Select **Bearer Token** -> paste the **Customer Token**.
- **Body**: Select **raw** -> **JSON**
- **Payload**:
```json
{
  "rating": 5,
  "comment": "Incredible durability and amazing ergonomics!"
}
```
- **Action**: Click **Send**.
- *Verification*: If you perform `GET {{baseUrl}}/api/products/PRODUCT_ID`, you will see that `rating` and `numReviews` have been automatically re-calculated!
