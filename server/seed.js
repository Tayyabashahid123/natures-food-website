// Run this once to seed products
const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Product.deleteMany({});
  const products = [
  {
    name: "Whole Cumin Seeds",
    description: "Earthy and warm seeds essential for tempering and adding depth to curries.",
    price: 100,
    image: "http://localhost:5000/images/cumin.jpeg" 
  },
  {
    name: "Turmeric Powder",
    description: "Pure, golden, and aromatic — the essence of health. Finely ground for maximum color and flavor.",
    price: 500,
    image: "http://localhost:5000/images/turmeric.jpeg"
  },
  {
    name: "Black Peppercorns",
    description: "Premium peppercorns for a sharp, fresh burst of flavour when ground.",
    price: 180,
    image: "http://localhost:5000/images/blackpepper.jpeg"
  },
  {
    name: "Kashmiri Chili Powder",
    description: "Bold, fiery flavor that awakens every dish, providing deep red color with moderate heat.",
    price: 450,
    image: "http://localhost:5000/images/chilli-powder.jpeg"
  },
  {
    name: "Whole Cloves",
    description: "Pungent and highly aromatic spice perfect for slow-cooked meats, baked goods, and hot beverages.",
    price: 350,
    image: "http://localhost:5000/images/cloves.jpeg"
  }
];

  await Product.insertMany(products);
  console.log("Products seeded!");
  mongoose.disconnect();
});
