const express = require("express");
const Order = require("../models/orders");
const router = express.Router();

// Place Order
router.post("/cart", async (req, res) => {
  const { userId, cartItems } = req.body;

  if (!userId || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Invalid input. Please provide userId and cartItems." });
  }

  try {
    let userOrder = await Order.findOne({ userId });

    if (userOrder) {
      userOrder.orders.push({ products: cartItems, orderDate: new Date() });
      await userOrder.save();
    } else {
      userOrder = new Order({
        userId,
        orders: [{ products: cartItems, orderDate: new Date() }],
      });
      await userOrder.save();
    }

    res.status(200).json({ message: "Order added successfully!", order: userOrder });
  } catch (error) {
    res.status(500).json({ error: "Failed to add order." });
  }
});

// Get Orders
router.get("/", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const userOrder = await Order.findOne({ userId });

    if (!userOrder) {
      return res.status(404).json({ error: "No orders found for this user." });
    }

    res.status(200).json({ orders: userOrder });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

module.exports = router;
