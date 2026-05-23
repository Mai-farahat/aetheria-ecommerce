# Aetheria | Premium E-Commerce Platform

Aetheria is a robust, full-stack, responsive e-commerce web application featuring a modern glassmorphism design system, interactive product catalogs, real-time reviews, and a complete administrative control panel.

---

## 🚀 Tech Stack

- **Backend**: Node.js + Express (REST API with JWT authorization)
- **Database**: MongoDB + Mongoose Schemas
- **Frontend**: Vanilla HTML5, Premium CSS Custom Properties, Responsive Layouts, and Modern ES Modules
- **Integrations**: Stripe Payments, Cloudinary Uploads, and Nodemailer Emails (configured with smart local mock fallbacks)
- **Containerization**: Docker Compose for local database provisioning

---

## 🌟 Key Features

### 🛍️ Customer storefront
- **Interactive Catalog**: Search by keyword, filter by categories list, filter by price thresholds, and sort by price or average rating.
- **Product Details & Gallery**: Interactive image galleries, stock thresholds tracking, and dynamic review submission (recalculates overall average product rating instantly).
- **Shopping Cart**: Real-time quantity validation, LocalStorage persistence, subtotal calculation, and badges updates.
- **Secure Checkout**: Dynamic shipping information pre-fill and redirection to checkout sessions.

### 👑 Admin Management Panel
- **Operational Metrics**: Total revenue dashboard, orders count, and catalog count.
- **Product CRUD**: Interface to add new items (with local image file attachments uploads), edit properties, change stock, and delete items.
- **Orders Manager**: Overview of all checkout histories and dropdown controls to update transaction states (`pending`, `paid`, `shipped`, `delivered`, `cancelled`).

---

## 🛠️ Getting Started & Setup

Follow these simple steps to run the application locally on your machine:

### 1. Provision the Database
Ensure you have **Docker Desktop** running, then execute this command in the root folder to launch MongoDB:
```bash
docker compose up -d
```

### 2. Install Dependencies
Navigate to the `backend/` directory and install the required npm packages:
```bash
cd backend
npm install
```

### 3. Seed Database Mock Data
Initialize the database collections with placeholder categories, luxury products, reviews, and test users:
```bash
npm run seed
```

### 4. Start the Application Server
Run the local Express backend server (it automatically hosts the static vanilla frontend at root):
```bash
npm run dev
```
Once started, open your web browser and navigate to:
👉 **[http://localhost:5000/pages/index.html](http://localhost:5000/pages/index.html)**

---

## 🔑 Development & Testing Accounts

Use these pre-seeded profiles to test user actions:

| Role | Email Address | Password | Privileges / Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `admin123` | Control Panel access, CRUD products, change order status |
| **Standard Customer** | `user@example.com` | `user123` | Add items to cart, place orders, review products |

---

## 🔌 Out-of-the-Box Fallbacks (Zero Credentials Mode)

If you don't configure credentials in the backend `.env` file, the platform automatically switches to local developer fallbacks:
- **Payments**: Creates a mock checkout session ID and redirects you to a local success landing page (verifies payment status and updates orders ledger to `paid`).
- **File Uploads**: Product images are hosted locally inside `backend/uploads/` statically.
- **Email Notifications**: Mail alerts are outputted directly to the server terminal console.
