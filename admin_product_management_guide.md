# Project Documentation: Module 8 (Admin Product Management)

This guide provides a comprehensive technical overview and explanation of the **Admin Product Management Module** (Module 8). It covers the file structure, database schema, middleware, controller business logic, frontend API bindings, and common discussion questions.

---

## 📂 File Architecture

The following files implement this module's features:

```
ecommerce/
├── backend/
│   ├── config/
│   │   └── cloudinary.js     # Cloudinary cloud setup & verification
│   ├── models/
│   │   └── Product.js        # Mongoose Product Schema definition
│   ├── middleware/
│   │   ├── auth.js           # JWT decoding and verification
│   │   ├── admin.js          # Admin authorization guard
│   │   └── upload.js         # Multer configuration for file uploads
│   ├── controllers/
│   │   └── productController.js # Product CRUD & image logic handlers
│   └── routes/
│       └── products.js       # Product endpoints routing mapping
└── frontend/
    ├── js/
    │   └── api.js            # Fetch network wrapper & toast notifications
    └── pages/
        └── admin/
            └── products.html # CRUD administration panel UI template
```

---

## 🗄️ 1. Database Layer: `models/Product.js`

This file specifies the data structure of a Product in MongoDB. It uses **Mongoose** to enforce validation rules.

### Code:
```javascript
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      max: [100000, 'Price cannot exceed 100,000'],
      default: 0.0,
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select category for this product'],
    },
    images: [
      {
        type: String, // Stores Cloudinary secure URLs or local paths
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
```

### Explanation:
* **Fields**: Defines the essential attributes of a product (e.g. name, description, price, stock).
* **Relations**: The `category` field acts as a reference (`ref: 'Category'`) linking the product to a specific category ID.
* **Metadata**: `images` stores an array of image strings, allowing multiple product images. `rating` and `numReviews` dynamically compute averages.
* **Timestamps**: Automatically updates fields like `createdAt` and `updatedAt`.

---

## 🛣️ 2. API Routes Mapping: `routes/products.js`

This file maps HTTP request endpoints to specific controller methods. It secures admin endpoints using guards.

### Code:
```javascript
import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public reads, Admin writes
router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.array('images', 5), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.array('images', 5), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
```

### Explanation:
* **Public Access**: Any visitor can send a `GET` request to `/` or `/:id` to browse the catalog.
* **Admin Access**: Write commands (`POST`, `PUT`, `DELETE`) are protected by passing through three chained middlewares:
  1. `protect`: Verifies registration token.
  2. `admin`: Confirms user is an admin.
  3. `upload.array('images', 5)`: Parses the incoming file upload fields from the client.

---

## 🔒 3. Security & Upload Middlewares

These components run sequentially before requests reach the controller logic.

### A. Authentication Verify: `middleware/auth.js`
Extracts and decodes the JWT token from request authorization headers.
```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_12345!');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};
```

### B. Admin Role Guard: `middleware/admin.js`
Verifies user permissions before granting entry.
```javascript
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin resources only' });
  }
};
```

### C. File Stager & Filter: `middleware/upload.js`
Captures raw file uploads via Multer, validates size/types, and saves them locally.
```javascript
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) cb(null, true);
  else cb(new Error('Only images are allowed!'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

export default upload;
```

---

## 🧠 4. Business Logic layer: `controllers/productController.js`

Handles the creation, modification, and removal of database items, alongside Cloudinary file transfers.

### Image Upload Logic:
```javascript
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';

const uploadImage = async (file) => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ecommerce',
      });
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path); // Delete local staged copy
      }
      return result.secure_url; // Return secure cloud URL
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return `/uploads/${file.filename}`; // Fallback to local server path on failure
    }
  } else {
    return `/uploads/${file.filename}`; // Fallback to local server path
  }
};
```

### Create Product Endpoint Handler:
```javascript
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    // Process images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        images.push(url);
      }
    } else {
      images.push('/assets/images/placeholder.jpg'); // Fallback placeholder
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      stock: Number(stock) || 0,
      category,
      images,
    });

    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 🎨 5. Frontend View: `pages/admin/products.html`

In the admin panel UI, we use the browser's native **FormData API** to submit forms with image files.

### Form Submission Handler:
```javascript
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const name = document.getElementById('prod-name').value;
  const price = document.getElementById('prod-price').value;
  const stock = document.getElementById('prod-stock').value;
  const category = document.getElementById('prod-category').value;
  const description = document.getElementById('prod-desc').value;
  const fileInput = document.getElementById('prod-images');

  // We construct FormData to pack binary files alongside texts
  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  formData.append('stock', stock);
  formData.append('category', category);
  formData.append('description', description);

  if (fileInput.files.length > 0) {
    for (let i = 0; i < fileInput.files.length; i++) {
      formData.append('images', fileInput.files[i]);
    }
  }

  try {
    let res;
    if (id) {
      // Modify existing item
      res = await apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // Add new item
      res = await apiRequest('/api/products', {
        method: 'POST',
        body: formData,
      });
    }

    if (res.success) {
      showToast(id ? 'Product updated!' : 'Product added!', 'success');
      modal.style.display = 'none';
      await loadAdminProducts();
    }
  } catch (err) {
    console.error(err);
  }
});
```

---

## ❓ Discussion Q&A Checklist

During the presentation, the instructor might ask the following questions:

#### 1. Why do you use `FormData` instead of sending `JSON.stringify(body)`?
> **Answer**: Regular JSON cannot transmit binary file formats (like pictures). `FormData` wraps data in the `multipart/form-data` encoding, allowing both text parameters and raw image files to be sent in a single HTTP request.

#### 2. What is the role of `Multer`?
> **Answer**: Express by default cannot parse multipart form payloads. `Multer` is a Node.js middleware for handling `multipart/form-data`, which extracts file inputs, validates them against allowed formats, and saves them to a temporary directory.

#### 3. How does the server verify that you are authorized to edit products?
> **Answer**: Every admin request attaches a Bearer JWT token in its authorization header. The backend parses this token in `protect` to identify the user, then checks `admin.js` to ensure the user's role is `'admin'`.

#### 4. How does the fallback image system work?
> **Answer**: If Cloudinary API credentials are provided in `.env`, images are uploaded to Cloudinary, and the local copies are deleted. If credentials are missing, the server saves the files in its local `uploads/` folder and returns local paths (e.g. `/uploads/image.jpg`).
