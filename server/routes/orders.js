const express = require("express");
const auth = require("../middleware/auth");
const {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrder
} = require("../controllers/orderController");

const { returnSale, getReturnedOrders } = require("../controllers/returnController");

const router = express.Router();

// CREATE order
router.post("/", auth, createOrder);

// GET all orders
router.get("/", auth, getAllOrders);

// GET returned orders ✅ must come BEFORE dynamic :id
router.get("/returned", auth, getReturnedOrders);

// Dynamic routes last
router.get("/:id", auth, getOrderById);
router.patch("/:id/status", auth, updateOrderStatus);
router.patch("/:id", auth, updateOrder);
router.patch("/:id/return", auth, returnSale);

module.exports = router;
