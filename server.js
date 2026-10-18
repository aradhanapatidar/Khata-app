const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config(); // .env ki values process.env me load karta hai
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());          // frontend ko API call karne dega
app.use(express.json());  // JSON body padhne ke liye (req.body)

app.get("/", (req, res) => res.send("Khata API running"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/transactions", require("./routes/transactions"));

// Global error handler: koi bhi route crash kare to server band nahi hoga
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

// Pehle database connect, phir server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection failed:", err.message));