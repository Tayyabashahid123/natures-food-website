const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },          // sale price
  purchasePrice: { type: Number, required: true },  // purchase price
  stock: { type: Number, required: true, default: 0 },
  image: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
