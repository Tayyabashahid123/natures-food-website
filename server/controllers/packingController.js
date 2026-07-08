const Order = require("../models/Order");

exports.getPackingList = async (req, res) => {
  try {
    const orders = await Order.find({ status: "pending" });

    if (!orders.length) return res.json([]);

    const packingMap = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.productName}-${item.slabLabel}`;

        if (!packingMap[key]) {
          packingMap[key] = {
            productName: item.productName,
            slabLabel: item.slabLabel,
            packets: 0,
            totalGrams: 0,
            customers: []
          };
        }

        packingMap[key].packets += item.quantity;
        packingMap[key].totalGrams += item.quantity * item.gramsUsed;
        packingMap[key].customers.push(order.customerName || "Walk-in");
      });
    });

    res.json(Object.values(packingMap));
  } catch (err) {
    console.error("Packing error:", err);
    res.status(500).json([]);
  }
};
