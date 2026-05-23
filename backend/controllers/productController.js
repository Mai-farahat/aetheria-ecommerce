import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';

// Helper to handle Cloudinary upload or local path fallback
const uploadImage = async (file) => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ecommerce',
      });
      // Delete local temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Fallback to local path if Cloudinary fails
      return `/uploads/${file.filename}`;
    }
  } else {
    // Return local static path
    return `/uploads/${file.filename}`;
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    return res.json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/products/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    const category = await Category.create({ name, description });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products (with search, category filter, sort, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    // Search query
    const keyword = req.query.search
      ? {
          name: {
            $regex: req.query.search,
            $options: 'i',
          },
        }
      : {};

    // Category query
    const categoryQuery = req.query.category ? { category: req.query.category } : {};

    // Price query
    let priceQuery = {};
    if (req.query.minPrice || req.query.maxPrice) {
      priceQuery.price = {};
      if (req.query.minPrice) priceQuery.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceQuery.price.$lte = Number(req.query.maxPrice);
    }

    const filterQuery = { ...keyword, ...categoryQuery, ...priceQuery };

    // Sorting
    let sortQuery = { createdAt: -1 }; // default: newest
    if (req.query.sort) {
      if (req.query.sort === 'price-asc') sortQuery = { price: 1 };
      else if (req.query.sort === 'price-desc') sortQuery = { price: -1 };
      else if (req.query.sort === 'rating') sortQuery = { rating: -1 };
    }

    const count = await Product.countDocuments(filterQuery);
    const products = await Product.find(filterQuery)
      .populate('category', 'name')
      .sort(sortQuery)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    return res.json({
      success: true,
      data: {
        products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (product) {
      return res.json({ success: true, data: product });
    } else {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const categoryObj = await Category.findById(category);
    if (!categoryObj) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    // Process images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        images.push(url);
      }
    } else {
      // Add a standard modern fallback mockup image
      images.push('/assets/images/placeholder.jpg');
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
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, existingImages } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate Category if changing
    if (category) {
      const categoryObj = await Category.findById(category);
      if (!categoryObj) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      product.category = category;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.stock = stock !== undefined ? Number(stock) : product.stock;

    // Handle images: we might keep some existing ones, and append new ones
    let images = [];
    if (existingImages) {
      images = Array.isArray(existingImages) ? existingImages : [existingImages];
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        images.push(url);
      }
    }

    if (images.length > 0) {
      product.images = images;
    }

    const updatedProduct = await product.save();
    return res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete associated reviews
    await Product.deleteOne({ _id: req.params.id });

    return res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
