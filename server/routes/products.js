const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock
} = require("../controllers/productController");

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only
router.post("/", auth, upload.single("image"), createProduct);
router.put("/:id", auth, upload.single("image"), updateProduct);
router.delete("/:id", auth, deleteProduct);
router.patch("/:id", auth, updateProductStock);

module.exports = router;
