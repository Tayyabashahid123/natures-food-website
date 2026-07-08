const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth"); // admin auth
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  returnOrder,
  markOrderPaid,
  getDailyProfitReport
} = require("../controllers/orderController");

// ------------------ ORDERS ROUTES ------------------

// Get all ordersS
router.get("/", auth, getOrders);

// Get single order by ID
router.get("/:id", auth, getOrderById);

// Create a new order
router.post("/", auth, createOrder);

// Update an order (edit items, slabs, etc.)
router.put("/:id", auth, updateOrder);
router.patch("/:id", auth, updateOrder);
// Delete an order
router.delete("/:id", auth, deleteOrder);

router.get("/reports/daily", auth, getDailyProfitReport);

// Return an order
router.patch("/:id/return", auth, returnOrder);

// change payment status to paid
router.patch("/:id/pay", auth, markOrderPaid);




module.exports = router;
