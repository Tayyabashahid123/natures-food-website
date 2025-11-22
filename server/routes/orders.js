const express = require("express");
const auth = require("../middleware/auth");
const {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", auth, createOrder);
router.get("/", auth, getAllOrders);
router.get("/:id", auth, getOrderById);
router.patch("/:id/status", auth, updateOrderStatus);

module.exports = router;
