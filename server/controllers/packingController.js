const Order = require("../models/Order");

exports.getPackingList = async (req, res) => {
  try {
    const orders = await Order.find({ status: "pending" });

    if (!orders || orders.length === 0) return res.json([]);

    const packingMap = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.name.toLowerCase();

        if (!packingMap[key]) {
          packingMap[key] = {
            name: item.name,
            totalQuantity: 0,
            customers: []
          };
        }

        packingMap[key].totalQuantity += item.quantity;
        packingMap[key].customers.push(order.customerName || "Walk-in");
      });
    });

    res.json(Object.values(packingMap));
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
};
