const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const invoiceRoutes = require("./routes/invoiceRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const dispatchRoutes = require("./routes/dispatchRoutes.js");
const authRoutes = require('./routes/authRoutes.js');

const app = express();
const allowedOrigins = [
  'http://localhost:3000', // Your local dev
  process.env.FRONTEND_URL  // Your live site URL from Render
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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
