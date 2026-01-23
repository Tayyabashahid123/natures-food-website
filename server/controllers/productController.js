const Product = require("../models/Product");

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      purchasePrice,
      stock,
      category
    } = req.body;

    if (!name || !price || !purchasePrice || !stock) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      purchasePrice: Number(purchasePrice),
      stock: Number(stock),
      category,
      image: req.file ? `images/${req.file.filename}` : ""
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//update
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, purchasePrice, stock, category, description } = req.body;

    const productData = { name, price, purchasePrice, stock, category, description };

    if (req.file) {
      productData.image = `uploads/products/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE STOCK
exports.updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock == null) return res.status(400).json({ message: "Stock is required" });

    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
