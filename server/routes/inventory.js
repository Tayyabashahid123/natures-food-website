const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const InventoryHistory = require("../models/InventoryHistory");

// --- Stock-In (POST) ---
router.post("/stock-in", async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity) 
      return res.status(400).json({ message: "Product and quantity required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const stockBefore = product.stockGrams;
    product.stockGrams += Number(quantity);
    await product.save(); // ✅ Save updated stock

    // Save history
    await InventoryHistory.create({
      product: productId,
      changeGrams: Number(quantity),
      type: "STOCK_IN",
      reason,
      stockBefore,
      stockAfter: product.stockGrams,
    });

    res.json({ success: true, newStock: product.stockGrams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Fetch Inventory History ---
router.get("/history", async (req, res) => {
  try {
    const history = await InventoryHistory.find()
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
