const router = require("express").Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { Customer, Transaction } = require("../models");

router.use(auth);

// Udhaar ya payment ki entry
router.post("/", async (req, res) => {
  const { customer, type, amount, note } = req.body;

  if (!customer || !type || !amount)
    return res.status(400).json({ error: "customer, type and amount are required" });
  if (!["udhaar", "payment"].includes(type))
    return res.status(400).json({ error: "type must be udhaar or payment" });
  if (Number(amount) <= 0)
    return res.status(400).json({ error: "amount must be greater than 0" });

  // Check: ye customer isi user ka hai?
  const owns = await Customer.findOne({ _id: customer, user: req.userId });
  if (!owns) return res.status(404).json({ error: "Customer not found" });

  const tx = await Transaction.create({
    user: req.userId, customer, type, amount: Number(amount), note,
  });
  res.status(201).json(tx);
});

// Ek customer ki saari entries
router.get("/customer/:id", async (req, res) => {
  const list = await Transaction.find({
    user: req.userId,
    customer: req.params.id,
  }).sort("-createdAt");
  res.json(list);
});

// Customer-wise baaki paisa + total
router.get("/summary", async (req, res) => {
  const customers = await Transaction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
    {
      $group: {
        _id: "$customer",
        due: {
          $sum: {
            $cond: [{ $eq: ["$type", "udhaar"] }, "$amount", { $multiply: ["$amount", -1] }],
          },
        },
      },
    },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "customer" } },
    { $unwind: "$customer" },
    { $project: { _id: 1, name: "$customer.name", phone: "$customer.phone", due: 1 } },
    { $sort: { due: -1 } },
  ]);

  const totalDue = customers.reduce((sum, c) => sum + c.due, 0);
  res.json({ totalDue, customers });
});

module.exports = router;