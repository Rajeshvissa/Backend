import express from "express";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import { orderSchema } from "../Validation/schemas.js";
import { validate } from "../middleware/validate.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();
router.post("/", isAuthenticated, validate(orderSchema), async (req, res) => {
  try {
    const { customer_id, amount, status } = req.body;


    const order = new Order({ customer_id, amount, status });
    await order.save();

    if (status === "completed") {
      await Customer.findByIdAndUpdate(customer_id, {
        $inc: { total_spend: amount },
        $set: { last_visit_date: new Date() },
      });
    }

    res.status(201).json({ message: "Order created", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer_id", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", validate(orderSchema), async (req, res) => {
  try {
    const { customer_id, amount, status } = req.body;
    const order = new Order({ customer_id, amount, status });
    await order.save();
    await Customer.findByIdAndUpdate(customer_id, {
      $inc: { total_spend: amount },
      $set: { last_visit_date: new Date() },
    });

    res.status(201).json({ message: "Order created", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("customer_id", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
