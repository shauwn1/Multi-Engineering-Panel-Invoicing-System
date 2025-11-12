const express = require("express");
const router = express.Router();
const Payment = require("../models/payment.js");
const Invoice = require("../models/invoice.js");
const { protect } = require('../middleware/authMiddleware.js');

router.use(protect);
router.post("/", async (req, res) => {
  try {
    const { invoiceId, amountPaid, paymentMethod, chequeNo, chequeBank, chequeDate } = req.body;

    const lastPayment = await Payment.findOne().sort({ createdAt: -1 });
    let nextReceiptNo;

    if (!lastPayment || !lastPayment.receiptNo) {
      nextReceiptNo = "RCPT-000001";
    } else {
      const lastNum = parseInt(lastPayment.receiptNo.split("-")[1], 10);
      const nextNum = (lastNum + 1).toString().padStart(6, "0");
      nextReceiptNo = `RCPT-${nextNum}`;
    }
    
    const newPaymentData = {
        receiptNo: nextReceiptNo, 
        invoiceId,
        amountPaid,
        paymentMethod,
        chequeNo,
        chequeBank,
        chequeDate,
        paymentDate: new Date(),
    };

    const payment = new Payment(newPaymentData);
    await payment.save();

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { $inc: { advance: amountPaid, balance: -amountPaid } },
      { new: true }
    );

    res.status(201).json({ payment, updatedInvoice });
  } catch (err) {
    console.error("❌ PAYMENT SAVE ERROR:", err.message); 
    res.status(400).json({ error: err.message });
  }
});

// 📌 Get all payments for a specific invoice
router.get("/history/:invoiceId", async (req, res) => {
  try {
    const payments = await Payment.find({
      invoiceId: req.params.invoiceId,
    }).sort({ paymentDate: 1 }); 

    if (!payments) {
      return res.json([]);
    }
    res.json(payments);
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;