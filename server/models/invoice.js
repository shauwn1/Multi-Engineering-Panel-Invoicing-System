// invoicing-system/server/models/invoice.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantityType: {
    type: String,
    enum: ["NOS", "meters", "feet"],
    required: true,
  },
  quantity: { type: Number, required: true, min: 0 },
  unitRate: { type: Number, required: true, min: 0 },
  unitAmount: { type: Number, required: true, min: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerAddress: { type: String },

    // ✅ Newly added fields
    telephone: { type: String }, // Optional but allows contact details
    email: { type: String, match: /.+\@.+\..+/ }, // Regex ensures valid email format
     paymentType: { type: String, enum: ["Cash", "Credit", "Check", "Online"], required: true },
    date: { type: Date, required: true },
    quotationNo: { type: String },
    poNo: { type: String },
    chequeNo: { type: String },
    chequeBank: { type: String },
    chequeDate: { type: Date },
    items: { type: [itemSchema], required: true },
    total: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, default: 0, min: 0 },
    advance: { type: Number, default: 0, min: 0 },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
