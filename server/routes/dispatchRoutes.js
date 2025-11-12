const express = require("express");
const router = express.Router();
const DispatchNote = require("../models/dispatchNote.js");
const Invoice = require("../models/invoice.js"); 
const { sendSms } = require('../services/smsService.js'); 
const { protect } = require('../middleware/authMiddleware.js');

router.use(protect);

router.get("/by-invoice/:invoiceId", async (req, res) => {
  try {
    const note = await DispatchNote.findOne({ invoiceId: req.params.invoiceId });
    res.json(note); 
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { invoiceId, specialNote } = req.body;
    
    let note = await DispatchNote.findOne({ invoiceId });

    if (note) {
      note.specialNote = specialNote;
    } else {
      const lastNote = await DispatchNote.findOne().sort({ createdAt: -1 });
      let nextDispatchNo = "DN-000001";
      if (lastNote && lastNote.dispatchNo) {
        const lastNum = parseInt(lastNote.dispatchNo.split("-")[1], 10);
        nextDispatchNo = `DN-${(lastNum + 1).toString().padStart(6, "0")}`;
      }
      note = new DispatchNote({
        invoiceId,
        specialNote,
        dispatchNo: nextDispatchNo,
      });
    }
    
    await note.save();

    (async () => {
      try {
        const invoice = await Invoice.findById(invoiceId);
        
        if (invoice && invoice.telephone) {
          const message = `Dear ${invoice.customerName}, your items for invoice ${invoice.invoiceNo} are out for dispatch. Dispatch Note: ${note.dispatchNo}.`;
          
          await sendSms(invoice.telephone, message);
        } else {
          console.warn(`[Dispatch] Invoice ${invoiceId} has no phone number. Skipping SMS.`);
        }
      } catch (err) {
        console.error(`[Dispatch] Error during background SMS task:`, err.message);
      }
    })(); 

    res.status(201).json(note); 
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;