const Order = require("../models/Order");
const Product = require("../models/Product");

exports.returnSale = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.status === "returned")
      return res.status(400).json({ message: "Order already returned" });

    if (order.status !== "completed")
      return res.status(400).json({ message: "Only completed sales can be returned" });

    // ✅ Restore inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    // ✅ Mark as returned
    order.status = "returned";
    order.returnedAt = new Date();

    await order.save();

    res.json({
      message: "Sale returned successfully",
      order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getReturnedOrders = async (req, res) => {
  try {
    console.log("Fetching returned orders...");
    const returnedOrders = await Order.find({ status: "returned" }).sort({ returnedAt: -1 });
    console.log("Returned orders found:", returnedOrders.length);
    res.json(returnedOrders);
  } catch (err) {
    console.error("Error fetching returned orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};
