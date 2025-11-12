const express = require("express");
const router = express.Router();
const Invoice = require("../models/invoice.js");
const DispatchNote = require("../models/dispatchNote.js");
const { startOfDay, startOfMonth } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const { protect } = require('../middleware/authMiddleware.js');

router.use(protect);

// Get next invoice number
router.get("/last-invoice-number", async (req, res) => {
    try {
        const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
        if (!lastInvoice) return res.json({ nextInvoiceNo: "MEP-000001" });
        const lastNo = lastInvoice.invoiceNo;
        const lastNum = parseInt(lastNo.split("-")[1], 10);
        const nextNum = (lastNum + 1).toString().padStart(6, "0");
        res.json({ nextInvoiceNo: `MEP-${nextNum}` });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Get aggregated dashboard stats (DEFINITIVE TIME ZONE FIX)
router.get("/stats", async (req, res) => {
    try {
        const timeZone = 'Asia/Colombo';
        const nowInColombo = utcToZonedTime(new Date(), timeZone);
        const startOfToday = startOfDay(nowInColombo);
        const startOfMonthLocal = startOfMonth(nowInColombo);

        const stats = await Invoice.aggregate([
            {
                $facet: {
                    dailySales: [
                        { $match: { date: { $gte: startOfToday } } },
                        { $group: { _id: "daily", total: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
                    ],
                    monthlySales: [
                        { $match: { date: { $gte: startOfMonthLocal } } },
                        { $group: { _id: "monthly", total: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
                    ],
                    totalOutstandingCredit: [
                        { $match: { paymentType: "Credit", balance: { $gt: 0 } } },
                        { $group: { _id: "credit", total: { $sum: "$balance" }, count: { $sum: 1 } } }
                    ]
                }
            }
        ]);
        const formatResult = (data) => ({ total: data[0]?.total || 0, count: data[0]?.count || 0 });
        res.json({
            dailySales: formatResult(stats[0].dailySales),
            monthlySales: formatResult(stats[0].monthlySales),
            totalOutstandingCredit: formatResult(stats[0].totalOutstandingCredit),
        });
    } catch (err) {
        console.error("Failed to fetch dashboard stats:", err.message);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
});

router.get("/sales/over-time", async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const salesData = await Invoice.aggregate([
            { $match: { date: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "Asia/Colombo" } }, totalSales: { $sum: "$grandTotal" } } },
            { $sort: { _id: 1 } },
        ]);
        res.json(salesData);
    } catch (err) { res.status(500).json({ error: "Failed to fetch sales data" }); }
});
router.get("/credit", async (req, res) => {
    try {
        const creditInvoices = await Invoice.find({ paymentType: "Credit", balance: { $gt: 0 } }).sort({ date: 1 });
        res.json(creditInvoices);
    } catch (error) { res.status(500).json({ error: "Failed to fetch credit invoices" }); }
});
// REPLACE your existing 'router.get("/", ...)' with this:
router.get("/", async (req, res) => {
    try {
        const { search, paymentType, startDate, endDate, sort, limit } = req.query;
        const query = {};

        if (search) { 
            query.$or = [
                { invoiceNo: { $regex: search, $options: "i" } }, 
                { customerName: { $regex: search, $options: "i" } }
            ]; 
        }
        if (paymentType && paymentType !== 'All') { 
            query.paymentType = paymentType; 
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                query.date.$lte = endOfDay;
            }
        }
        
        let sortOptions = { createdAt: -1 };
        if (sort === 'date') {
            sortOptions = { date: -1 };
        }
        
        const queryLimit = parseInt(limit) || 0;

        const invoices = await Invoice.find(query)
            .sort(sortOptions)
            .limit(queryLimit);

        const invoiceIds = invoices.map(inv => inv._id);
        const notes = await DispatchNote.find({ invoiceId: { $in: invoiceIds } }).select('invoiceId');
        const dispatchNoteInvoiceIds = new Set(notes.map(note => note.invoiceId.toString()));
        
        const invoicesWithDispatchStatus = invoices.map(invoice => {
            const invoiceObj = invoice.toObject();
            invoiceObj.hasDispatchNote = dispatchNoteInvoiceIds.has(invoice._id.toString());
            return invoiceObj;
        });
        
        res.json(invoicesWithDispatchStatus);

    } catch (error) { 
        res.status(500).json({ error: "Failed to fetch invoices" }); 
    }
});



router.get("/:id", async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: "Not found" });
        res.json(invoice);
    } catch (error) { res.status(500).json({ error: error.message }); }
});
router.post("/", async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        await invoice.save();
        const lastNote = await DispatchNote.findOne().sort({ createdAt: -1 });
        let nextDispatchNo = "DN-000001";
        if (lastNote && lastNote.dispatchNo) {
            const lastNum = parseInt(lastNote.dispatchNo.split("-")[1], 10);
            nextDispatchNo = `DN-${(lastNum + 1).toString().padStart(6, "0")}`;
        }
        const newDispatchNote = new DispatchNote({ invoiceId: invoice._id, dispatchNo: nextDispatchNo, specialNote: "" });
        await newDispatchNote.save();
        res.status(201).json(invoice);
    } catch (err) { res.status(400).json({ error: err.message }); }
});


router.get("/stats/status", async (req, res) => {
    try {
        const stats = await Invoice.aggregate([
            {
                $group: {
                    _id: {
                        $cond: [
                            { $lte: ["$balance", 0] }, "paid",
                            { $lt: ["$balance", "$grandTotal"] }, "partial",
                            "unpaid"
                        ]
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = { paid: 0, partial: 0, unpaid: 0 };
        stats.forEach(stat => {
            result[stat._id] = stat.count;
        });
        res.json(result);

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch status stats" });
    }
});

router.get("/stats/status", async (req, res) => {
    try {
        const stats = await Invoice.aggregate([
            {
                $group: {
                    _id: {
                        $cond: [
                            { $lte: ["$balance", 0] }, "paid",
                            { $lt: ["$balance", "$grandTotal"] }, "partial",
                            "unpaid"
                        ]
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = { paid: 0, partial: 0, unpaid: 0 };
        stats.forEach(stat => {
            result[stat._id] = stat.count;
        });
        res.json(result);

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch status stats" });
    }
});

module.exports = router;