# 🌿 Nature's Food - Inventory & Sales Management System

A full-stack inventory and sales management system built for a spice business. The application allows administrators to manage products, inventory, orders, customers, sales, returns, and payments through a modern web interface.

## 🚀 Features

### Dashboard analytic
- show a short summary of monthly progress
- average monthly sale
- avg monthly order value
- total sale
- total orders
- pending orders
- products sold
- sale trend
- recent orders
- products out of stock


### 📦 Product Management
- Add, edit and delete products
- Upload product images
- Categorize products
- Manage stock in grams
- Support multiple packet sizes (slabs) per product
- Custom pricing for every slab

Example slabs:
- 20g
- 50g
- 100g
- 250g
- 500g
- 1kg

---

### 📊 Inventory Management

- Live inventory tracking
- Stock stored in grams
- Stock-In functionality
- Inventory history
- Search products
- Sort by:
  - Name
  - Stock level
- Low stock detection
- Out of stock detection

---

### 🛒 Order Management

- Create customer orders
- Walk-in customers supported
- Multiple products per order
- Quantity management
- Automatic stock deduction
- Order editing
- Order status management

Order Status:
- Pending
- Completed
- Returned

---

### 💰 Pricing & Calculations

Automatically calculates:

- Subtotal
- Discount
- Discount Amount
- Profit Percentage
- Profit Amount
- Final Total

Supports custom profit percentages and discounts.

---

### 💳 Payment Management

Payment methods:

- Credit
- Paid

Features:

- Mark credit orders as paid
- Payment tracking
- Payment status displayed on receipts and sales history

---

### 🧾 Receipt System

Generate printable receipts for:

- Completed Sales
- Returned Sales

Receipt includes:

- Customer Information
- Products
- Quantities
- Prices
- Payment Method
- Sale Date
- Grand Total

---

### 🔄 Sale Returns

Return completed sales.

Features:

- Restore inventory automatically
- Generate return receipt
- Store return date
- Track returned sales separately

---

### 📈 Sales History

View complete sales history.

Includes:

- Customer search
- Date range filtering
- Sorting
- Profit information
- Discount information
- Payment method
- Receipt viewing

---

### 📋 Returned Sales

Dedicated page showing:

- Returned orders
- Refund amount
- Return date
- Customer details
- Return receipt

---

### 👤 Customer Details

View customer information including:

- Name
- Phone Number
- Address
- Order history

---

## 🛠 Tech Stack

### Frontend

- React.js
- React Router
- JavaScript (ES6)
- CSS3

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas
- Mongoose

### Authentication

- JWT Authentication

---


## 📦 Database Models

### Product

- Name
- Category
- Image
- Stock (grams)
- Slabs
  - Label
  - Sale Price
  - Purchase Cost

---

### Order

- Customer Information
- Ordered Items
- Subtotal
- Discount
- Discount Amount
- Profit Percentage
- Profit Amount
- Total Amount
- Payment Method
- Status
- Sale Date
- Return Date

---

## 🔐 Admin Features

- Secure Login
- Protected Routes
- JWT Authentication

---

## 📱 Responsive Design

The application is designed to work on:

- Desktop
- Laptop
- Tablet
- Mobile

---

## 📷 Screens

- Dashboard
- Products
- Inventory
- Stock In
- Inventory History
- Orders
- Sales History
- Returned Sales
- Customer Details
- Printable Receipt

---

## ⚙ Installation

### Clone repository

```bash
git clone https://github.com/yourusername/natures-food.git
```

### Frontend

```bash
cd client
npm install
npm start
```

### Backend

```bash
cd server
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the server folder.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret
```

---

## Future Improvements

- Charts & graphs
- Barcode support
- Email receipts
- Backup & restore
- Cloud image storage (AWS S3 / Cloudinary)

---

## Author

**Tayyaba Shahid**

Full Stack Software Developer

Built using:

- React.js
- Node.js
- Express.js
- MongoDB