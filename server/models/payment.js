const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, required: true, unique: true },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    amountPaid: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Check", "Online"],
      required: true,
    },
    paymentDate: { type: Date, default: Date.now },
    chequeNo: { type: String },
    chequeBank: { type: String },
    chequeDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);