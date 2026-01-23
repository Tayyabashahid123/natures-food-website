const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, default: "Walk-in" },
    customerPhone: { type: String, default: "" },
    customerAddress: { type: String, default: "" },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        salePrice: { type: Number, required: true },
        purchasePrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],

    subtotal: { type: Number, required: true, default: 0 },
    profitAmount: { type: Number, required: true, default: 0 },
    profitPercent: { type: Number, required: true, default: 0 },

    discount: { type: Number, default: 0 },
    discountAmount: { type: Number, required: true, default: 0 },

    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },

    paymentMethod: { type: String, enum: ["cash", "online"], default: "cash" },
    returnedAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "completed", "returned"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
