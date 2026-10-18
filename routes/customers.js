const router = require("express").Router();
const auth = require("../middleware/auth");
const { Customer, Transaction } = require("../models");

router.use(auth); // is file ke saare routes protected

// Customer add
router.post("/", async (req, res) => {
  const { name, phone } = req.body;
  if (!name) return res.status(400).json({ error: "Customer name is required" });

  const customer = await Customer.create({ name, phone, user: req.userId });
  res.status(201).json(customer);
});

// Meri saari customers
router.get("/", async (req, res) => {
  const customers = await Customer.find({ user: req.userId }).sort("-createdAt");
  res.json(customers);
});

// Customer delete (uski saari entries bhi hat jayengi)
router.delete("/:id", async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  await Transaction.deleteMany({ customer: customer._id });
  res.json({ message: "Customer deleted" });
});

module.exports = router;