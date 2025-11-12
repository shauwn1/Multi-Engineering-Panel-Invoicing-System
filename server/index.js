const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const invoiceRoutes = require("./routes/invoiceRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const dispatchRoutes = require("./routes/dispatchRoutes.js");
const authRoutes = require('./routes/authRoutes.js');

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");

    // Mount routes after DB connection is successful
    app.use("/api/invoices", invoiceRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/dispatch", dispatchRoutes);
    app.use('/api/auth', authRoutes);
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
