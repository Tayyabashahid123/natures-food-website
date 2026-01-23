const Order = require("../models/Order");
const Product = require("../models/Product");

// -------------------- CREATE ORDER --------------------
exports.createOrder = async (req, res) => {
  try {
    let {
      customerName = "Walk-in",
      customerPhone = "",
      customerAddress = "",
      items = [],
      discount = 0, // discount % applied to all items
      tax = 0,
      paymentMethod = "cash",
    } = req.body;

    discount = Number(discount) || 0;
    tax = Number(tax) || 0;

    if (!items.length) return res.status(400).json({ message: "Order items required" });

    let subtotal = 0;
    let totalProfit = 0;
    let totalDiscount = 0;
    const formattedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (quantity <= 0) return res.status(400).json({ message: "Invalid quantity" });

      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.stock < quantity) return res.status(400).json({ message: `Not enough stock for ${product.name}` });

      const salePrice = Number(product.price);
      const purchasePrice = Number(product.purchasePrice || 0);

      // Calculate discount and profit per item
      const itemDiscount = parseFloat(((salePrice * discount) / 100).toFixed(2));
      const itemProfit = parseFloat((salePrice - purchasePrice - itemDiscount).toFixed(2));

      subtotal += salePrice * quantity;
      totalDiscount += itemDiscount * quantity;
      totalProfit += itemProfit * quantity;

      formattedItems.push({
        productId: product._id,
        name: product.name,
        quantity,
        salePrice,
        purchasePrice,
        total: salePrice * quantity,
        discountAmount: itemDiscount * quantity,
        profitAmount: itemProfit * quantity,
      });
    }

    const totalAmount = parseFloat((subtotal - totalDiscount + tax).toFixed(2));

    const order = new Order({
      customerName,
      customerPhone,
      customerAddress,
      items: formattedItems,
      subtotal,
      discount,
      discountAmount: totalDiscount,
      profitAmount: totalProfit,
      tax,
      totalAmount,
      paymentMethod,
      status: "pending",
    });

    await order.save();

    // Reduce stock
    for (const item of formattedItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- UPDATE ORDER --------------------
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let { items = [], discount = 0, status } = req.body;

    discount = Number(discount) || 0;
    if (!Array.isArray(items)) items = [];

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    // Restore previous stock
    for (const prev of order.items || []) {
      if (!prev.productId || !prev.quantity) continue;
      await Product.findByIdAndUpdate(prev.productId, { $inc: { stock: prev.quantity } });
    }

    let subtotal = 0;
    let totalProfit = 0;
    let totalDiscount = 0;
    const formattedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!item.productId || quantity <= 0) return res.status(400).json({ msg: "Invalid item in order" });

      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ msg: `Product not found` });
      if (product.stock < quantity) return res.status(400).json({ msg: `Not enough stock for ${product.name}` });

      const salePrice = Number(product.price);
      const purchasePrice = Number(product.purchasePrice || 0);

      const itemDiscount = parseFloat(((salePrice * discount) / 100).toFixed(2));
      const itemProfit = parseFloat((salePrice - purchasePrice - itemDiscount).toFixed(2));

      subtotal += salePrice * quantity;
      totalDiscount += itemDiscount * quantity;
      totalProfit += itemProfit * quantity;

      formattedItems.push({
        productId: product._id,
        name: product.name,
        quantity,
        salePrice,
        purchasePrice,
        total: salePrice * quantity,
        discountAmount: itemDiscount * quantity,
        profitAmount: itemProfit * quantity,
      });
    }

    const totalAmount = parseFloat((subtotal - totalDiscount).toFixed(2));

    order.items = formattedItems;
    order.subtotal = subtotal;
    order.discount = discount;
    order.discountAmount = totalDiscount;
    order.profitAmount = totalProfit;
    order.totalAmount = totalAmount;
    if (status) order.status = status;

    await order.save();

    // Reduce stock again
    for (const item of formattedItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.json({ msg: "Order updated", order });
  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


// -------------------- GET ALL ORDERS --------------------
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// -------------------- GET ORDER BY ID --------------------
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("GET ORDER ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// -------------------- UPDATE ORDER STATUS --------------------
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!["pending", "completed", "returned"].includes(status)) {
    return res.status(400).json({ msg: "Invalid status" });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    // If returned, restore stock and set returnedAt
    if (status === "returned" && order.status !== "returned") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
      order.returnedAt = new Date();
    }

    order.status = status;
    await order.save();

    res.json({ msg: "Order status updated", order });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ msg: "Failed to update order status" });
  }
};
