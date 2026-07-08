const Order = require("../models/Order");
const Product = require("../models/Product");

/* =========================
   CREATE ORDER
========================= */
    exports.createOrder = async (req, res) => {
      try {
        const {
          customerName,
          customerPhone,
          customerAddress,
          items,
          profit = 0,
          discount = 0,
          paymentMethod = "credit"
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ message: "Order must have at least one item" });
        }

        let subtotal = 0;
        let totalProfit = 0;
        const processedItems = [];

        for (const item of items) {
          const { productId, slabLabel, quantity } = item;

          if (!productId || !slabLabel || quantity <= 0) {
            return res.status(400).json({ message: "Invalid order item data" });
          }

          const product = await Product.findById(productId);
          if (!product) return res.status(404).json({ message: "Product not found" });

          const slab = product.slabs.find(s => s.label === slabLabel);
          if (!slab) {
            return res.status(404).json({ message: `Slab not found: ${slabLabel}` });
          }

          const gramsUsed = slab.gramsUsed * quantity;

          // if (product.stockGrams < gramsUsed) {
          //   return res.status(400).json({
          //     message: `Not enough stock for ${product.name} (${slab.label})`
          //   });
          // }

          product.stockGrams -= gramsUsed;
          await product.save();

          const itemSubtotal = slab.salePrice * quantity;
          const itemProfit = (slab.salePrice - slab.purchaseCost) * quantity;

          subtotal += itemSubtotal;
          totalProfit += itemProfit;

          processedItems.push({
            productId: product._id,
            productName: product.name,
            slabLabel: slab.label,
            gramsUsed,
            quantity,
            salePrice: slab.salePrice,
            purchaseCost: slab.purchaseCost,
            profit: itemProfit,
            finalTotal: subtotal
          });
        }

        const discountAmount = (subtotal * discount) / 100;
        const totalAmount = subtotal - discountAmount;
        const profitAmount = totalProfit - discountAmount;

        const profitPercentage =
          subtotal > 0 ? Number(((profitAmount / subtotal) * 100).toFixed(2)) : 0;

        const order = await Order.create({
          customerName,
          customerPhone,
          customerAddress,
          items: processedItems,
          subtotal,
          discount,
          discountAmount,
          profitAmount,
          profitPercentage,
          totalAmount,
          paymentMethod,
          status: "pending"
        });

        res.json(order);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    };

/* =========================
   GET ALL ORDERS
========================= */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET SINGLE ORDER
========================= */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE ORDER STATUS ONLY
   (PUT /orders/:id)
========================= */
exports.updateOrder = async (req, res) => {
  try {
    const { items, discount = 0, status, paymentMethod } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    /* 🔁 RESTOCK OLD ITEMS */
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockGrams: item.gramsUsed }
      });
    }

    let subtotal = 0;
    let totalProfit = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const slab = product.slabs.find(s => s.label === item.slabLabel);
      if (!slab) {
        return res.status(404).json({ message: `Slab not found: ${item.slabLabel}` });
      }

      const gramsUsed = slab.gramsUsed * item.quantity;

      // if (product.stockGrams < gramsUsed) {
      //   return res.status(400).json({
      //     message: `Not enough stock for ${product.name} (${slab.label})`
      //   });
      // }

      product.stockGrams -= gramsUsed;
      await product.save();

      const itemSubtotal = slab.salePrice * item.quantity;
      const itemProfit = (slab.salePrice - slab.purchaseCost) * item.quantity;

      subtotal += itemSubtotal;
      totalProfit += itemProfit;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        slabLabel: slab.label,
        gramsUsed,
        quantity: item.quantity,
        salePrice: slab.salePrice,
        purchaseCost: slab.purchaseCost,
        profit: itemProfit,
        finalTotal: subtotal

      });
    }

    const discountAmount = (subtotal * discount) / 100;
    const totalAmount = subtotal - discountAmount;
    const profitAmount = totalProfit - discountAmount;

    const profitPercentage =
      subtotal > 0 ? Number(((profitAmount / subtotal) * 100).toFixed(2)) : 0;

    order.items = processedItems;
    order.subtotal = subtotal;
    order.discount = discount;
    order.discountAmount = discountAmount;
    order.profitAmount = profitAmount;
    order.profitPercentage = profitPercentage;
    order.totalAmount = totalAmount;
    // Set sale date only when moving to completed for the first time
    if (status === "completed" && order.status !== "completed") {
      order.status = "completed";
      order.saledAt = new Date();
    } else if (status) {
      order.status = status;
    }
    order.paymentMethod = paymentMethod || order.paymentMethod;

    await order.save();
    res.json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   RETURN ORDER
   (PATCH /orders/:id/return)
========================= */
exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "returned") {
      return res.status(400).json({ message: "Order already returned" });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockGrams: item.gramsUsed }
      });
    }

    order.status = "returned";
    order.returnedAt = new Date();
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};





/* =========================
   DELETE ORDER
========================= */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getDailyProfitReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      {
        $match: { status: "completed" }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalSales: { $sum: "$totalAmount" },
          totalProfit: { $sum: "$profit" },
          totalDiscount: { $sum: "$discountAmount" },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* Payment status is changed from credit to paid */

exports.markOrderPaid  = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentMethod === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    order.paymentMethod = "paid";
    order.paidAt = new Date();
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};