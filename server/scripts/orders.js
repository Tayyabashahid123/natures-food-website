const mongoose = require("mongoose");
const Order = require("../models/Order"); // adjust path if needed

// -------------------- MONGOOSE CONNECTION --------------------
const MONGO_URI = "mongodb+srv://tayyabashahid3110_db_user:kLcdAqDC6jum9CJe@cluster0.kuechot.mongodb.net/NaturesFood?retryWrites=true&w=majority"; // replace with your DB URI

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// -------------------- UPDATE ORDERS --------------------
async function updateOrders() {
  try {
    const orders = await Order.find();

    for (let order of orders) {
      const profitAmount = parseFloat((order.subtotal * (order.profit / 100)).toFixed(2));
      const subtotalWithProfit = order.subtotal + profitAmount;
      const discountAmount = parseFloat((subtotalWithProfit * (order.discount / 100)).toFixed(2));
      const totalAmount = parseFloat((subtotalWithProfit - discountAmount).toFixed(2));

      await Order.updateOne(
        { _id: order._id },
        { profitAmount, discountAmount, totalAmount }
      );

      console.log(`Updated order ${order._id}`);
    }

    console.log("All orders updated successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error updating orders:", err);
    mongoose.disconnect();
  }
}

updateOrders();
