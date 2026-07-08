const mongoose = require("mongoose");

const slabSchema = new mongoose.Schema({
  label: { type: String, required: true },             // "20g", "50g", "Rs 500"
  type: { type: String, enum: ["GRAM", "AMOUNT"], required: true },
  gramsUsed: { type: Number, required: true, min: 0 }, // inventory used
  salePrice: { type: Number, required: true, min: 0 },
  purchaseCost: { type: Number, required: true, min: 0 }
}, { _id: true }); // ensure each slab has an _id for edit/delete

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  stockGrams: { type: Number, required: true},
  slabs: [slabSchema],
  category: { type: String, default: "" },
  image: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
