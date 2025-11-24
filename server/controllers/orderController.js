const Order = require("../models/Order");
const Product = require("../models/Product");

// -------------------- CREATE ORDER --------------------
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName = "Walk-in",
      customerPhone,
      customerAddress,
      items,
      subtotal,
      discount = 0,
      tax,
      totalAmount,
      paymentMethod
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: "No products in order" });
    }

    // Check inventory and reduce stock
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ msg: `Product ${item.name} not found` });
    //   if (product.stock < item.quantity) return res.status(400).json({ msg: `Insufficient stock for ${item.name}` });

      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      customerName,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      discount,
      tax,
      totalAmount,
      paymentMethod,
      status: "pending" // use lowercase for consistency with enum
    });

    await order.save();
    res.status(201).json(order);

  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ msg: "Order creation failed" });
  }
};

// -------------------- GET ORDER BY ID --------------------
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch order" });
  }
};

// -------------------- GET ALL ORDERS --------------------
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch orders" });
  }
};

// -------------------- UPDATE ORDER STATUS --------------------
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!["pending", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ msg: "Invalid status" });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update order status" });
  }
};
