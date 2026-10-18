const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
});

const customerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    phone: String,
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    type: { type: String, enum: ["udhaar", "payment"], required: true },
    amount: { type: Number, required: true, min: 1 },
    note: String,
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", userSchema),
  Customer: mongoose.model("Customer", customerSchema),
  Transaction: mongoose.model("Transaction", transactionSchema),
};