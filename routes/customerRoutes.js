import express from "express";
import Customer from "../models/Customer.js";
import { customerSchema } from "../Validation/schemas.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/", validate(customerSchema), async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ message: "Customer created", customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
