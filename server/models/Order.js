const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String },
    customerPhone: { type: String },
    customerAddress: {type: String },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: Number,
        price: Number,
        total: Number, // quantity * price
      },
    ],

    subtotal: Number,
    discount: Number,
    tax: Number,
    totalAmount: Number,

    paymentMethod: { type: String, enum: ["cash", "online"] },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
