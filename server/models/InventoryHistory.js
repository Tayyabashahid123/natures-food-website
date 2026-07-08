const mongoose = require("mongoose");

const InventoryHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  changeGrams: { type: Number, required: true },
  type: { type: String, enum: ["STOCK_IN", "STOCK_OUT"], required: true },
  reason: { type: String },
  stockBefore: { type: Number },
  stockAfter: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("InventoryHistory", InventoryHistorySchema);
