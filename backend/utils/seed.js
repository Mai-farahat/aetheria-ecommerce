import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    address: {
      street: '123 Admin Way',
      city: 'Metro City',
      zip: '10001',
    },
  },
  {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    address: {
      street: '456 Customer Ave',
      city: 'Suburbtown',
      zip: '90210',
    },
  },
];

const categories = [
  { name: 'Electronics', description: 'Gadgets, smartphones, and computers' },
  { name: 'Fashion & Apparel', description: 'Trendy clothes and accessories' },
  { name: 'Home & Living', description: 'Decors, furniture, and kitchen tools' },
  { name: 'Fitness & Sports', description: 'Exercise gears and outdoor equipment' },
];

const getProductsData = (catMap) => [
  {
    name: 'Aether Pods Max',
    description: 'Immersive sound experience with advanced active noise cancellation, premium build quality, and up to 40 hours of battery life.',
    price: 299.99,
    stock: 25,
    category: catMap['Electronics'],
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'],
    rating: 4.8,
    numReviews: 1,
  },
  {
    name: 'Titan Smart Chrono',
    description: 'Chrono smart-watch featuring custom OLED always-on watch faces, 24/7 biometric tracking, dynamic GPS tracking, and water resistance.',
    price: 189.50,
    stock: 12,
    category: catMap['Electronics'],
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'],
    rating: 4.5,
    numReviews: 0,
  },
  {
    name: 'Minimalist Leather Backpack',
    description: 'Handcrafted full-grain leather backpack featuring dedicated 16-inch laptop compartment and secret travel passport pocket.',
    price: 120.00,
    stock: 18,
    category: catMap['Fashion & Apparel'],
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60'],
    rating: 4.2,
    numReviews: 0,
  },
  {
    name: 'Eclipse Running Sneakers',
    description: 'Ultra-lightweight mesh sneakers designed for maximum energy return and breathability, optimized for city running.',
    price: 85.00,
    stock: 5,
    category: catMap['Fashion & Apparel'],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60'],
    rating: 4.0,
    numReviews: 0,
  },
  {
    name: 'Aura Glass Kettle',
    description: 'Sleek borosilicate glass electric kettle with custom multi-color temperature ring indicator and rapid boiling functionality.',
    price: 49.99,
    stock: 30,
    category: catMap['Home & Living'],
    images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60'],
    rating: 4.7,
    numReviews: 0,
  },
  {
    name: 'Onyx Adjustable Dumbbells',
    description: 'Heavy duty space-saving adjustable dumbbell system switching instantly between 5 to 50 lbs with dynamic click selector.',
    price: 249.00,
    stock: 8,
    category: catMap['Fitness & Sports'],
    images: ['https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&auto=format&fit=crop&q=60'],
    rating: 4.9,
    numReviews: 0,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce');
    console.log('Seed: Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Review.deleteMany();
    await Order.deleteMany();
    console.log('Seed: Cleared old collections...');

    // Create users
    const createdUsers = [];
    for (const u of users) {
      const newUser = await User.create(u);
      createdUsers.push(newUser);
    }
    console.log(`Seed: Created ${createdUsers.length} users.`);

    // Create categories
    const catMap = {};
    for (const c of categories) {
      const newCat = await Category.create(c);
      catMap[c.name] = newCat._id;
    }
    console.log(`Seed: Created ${Object.keys(catMap).length} categories.`);

    // Create products
    const productsData = getProductsData(catMap);
    const createdProducts = [];
    for (const p of productsData) {
      const newProd = await Product.create(p);
      createdProducts.push(newProd);
    }
    console.log(`Seed: Created ${createdProducts.length} products.`);

    // Create a default review for the first product
    await Review.create({
      user: createdUsers[1]._id, // John Doe
      product: createdProducts[0]._id, // Aether Pods Max
      rating: 5,
      comment: 'Absolutely love the active noise cancelling on these pods. Extremely premium sound!',
    });
    console.log('Seed: Created initial product review.');

    console.log('Database Seeding Successful! 🌱');
    process.exit(0);
  } catch (error) {
    console.error(`Database Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
