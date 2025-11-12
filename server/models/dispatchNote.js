const mongoose = require("mongoose");

const dispatchNoteSchema = new mongoose.Schema(
  {
    dispatchNo: { type: String, required: true, unique: true },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    specialNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DispatchNote", dispatchNoteSchema);