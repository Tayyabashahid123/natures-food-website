const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, stockGrams, category, slabs } = req.body;

    // Validate required fields
    if (!name || !stockGrams) {
      return res.status(400).json({ message: "Name and StockGrams are required" });
    }

    let slabsParsed = [];
    if (slabs) {
      slabsParsed = typeof slabs === "string" ? JSON.parse(slabs) : slabs;
      // validate each slab
      for (let s of slabsParsed) {
        if (!s.label || !s.type || s.gramsUsed == null || s.salePrice == null || s.purchaseCost == null) {
          return res.status(400).json({ message: "All slab fields are required" });
        }
      }
    }

    const product = new Product({
      name,
      stockGrams,
      category: category || "",
      slabs: slabsParsed,
      image: req.file ? `images/${req.file.filename}` : ""
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, stockGrams, category, slabs } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name) product.name = name;
    if (stockGrams != null) product.stockGrams = stockGrams;
    if (category != null) product.category = category;

    if (slabs) {
      const slabsParsed = typeof slabs === "string" ? JSON.parse(slabs) : slabs;
      product.slabs = slabsParsed;
    }

    if (req.file) {
      // delete old image
      if (product.image) {
        const oldPath = path.join(__dirname, "..", "public", product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.image = `images/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // delete image file
    if (product.image) {
      const oldPath = path.join(__dirname, "..", "public", product.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
