const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const invoiceRoutes = require("./routes/invoiceRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const dispatchRoutes = require("./routes/dispatchRoutes.js");
const authRoutes = require('./routes/authRoutes.js');

const app = express();

// Add your Frontend URL here so the frontend can talk to the backend
const allowedOrigins = [
  'http://localhost:3000',      // Local React
  'http://localhost:5173',      // Local Vite
  process.env.FRONTEND_URL      // Your Render Frontend URL (e.g. https://multi-engineering-panel-invoicing-system-1.onrender.com)
];

app.use(cors({
  origin: function (origin, callback) {
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

    app.use("/api/invoices", invoiceRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/dispatch", dispatchRoutes);
    app.use('/api/auth', authRoutes);

    // Simple root route to check if API is alive
    app.get('/', (req, res) => {
      res.send('API is running successfully');
    });
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();