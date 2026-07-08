const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  productName: String,

  slabLabel: String,
  gramsUsed: Number,

  quantity: { type: Number, required: true },

  salePrice: Number,
  purchaseCost: Number,
  profit: Number
});

const orderSchema = new mongoose.Schema(
  {
    customerName: String,
    customerPhone: String,
    customerAddress: String,

    items: [orderItemSchema],

    subtotal: Number,
    
    discount: {
      type: Number,
      default: 0
    },

    discountAmount: {
      type: Number,
      default: 0
    },

    profitAmount: {
      type: Number,
      required: true
    },

    profitPercentage: {
      type: Number,
      required: true
    },

    totalAmount: Number,

    paymentMethod: { type: String, enum: ["paid", "credit"] },

    status: {
      type: String,
      enum: ["completed", "pending", "returned"],
      default: "pending"
    },
    saledAt: Date,
    paidAt: Date,
    returnedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
