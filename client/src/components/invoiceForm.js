import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";
import InvoicePreview from "./InvoicePreview.js";
import "./invoiceForm.css";
import { useNavigate } from "react-router-dom";

const InvoiceForm = () => {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [quotationNo, setQuotationNo] = useState("");
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [chequeNo, setChequeNo] = useState("");
  const [chequeBank, setChequeBank] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState([
    {
      description: "",
      quantity: 0,
      unitPrice: 0,
      unit: "NOS",
      itemDiscount: 0,
    },
  ]);
  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDateTime] = useState(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Colombo",
      hour12: true,
    })
  );

  const componentRef = useRef();

  const total = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemDiscountAmount = (item.itemDiscount / 100) * itemTotal;
    return sum + (itemTotal - itemDiscountAmount);
  }, 0);
  const discountAmount = (discount / 100) * total;
  const grandTotal = total - discountAmount;
  const balance = grandTotal - advance;

  useEffect(() => {
    if (paymentType === 'Cash') {
      setAdvance(grandTotal);
    }
  }, [paymentType, grandTotal]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    if (!token) {
        console.error("No token found, redirecting to login");
        navigate('/login');
        return; 
    }

    const fetchInvoiceNo = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/invoices/last-invoice-number", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
          }
        );
        if (res.status === 401) {
            localStorage.removeItem('userInfo');
            navigate('/login');
            return;
        }
        if (!res.ok) throw new Error("Failed to fetch invoice number");
        const data = await res.json();
        setInvoiceNo(data.nextInvoiceNo);
      } catch (err) {
        console.error("Error fetching invoice number:", err);
        setInvoiceNo(`INV-${Date.now()}`);
      }
    };
    fetchInvoiceNo();
  }, [navigate]);

  const handlePrint = useReactToPrint({ contentRef: componentRef });

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 0,
        unitPrice: 0,
        unit: "NOS",
        itemDiscount: 0,
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] =
      field === "description" || field === "unit" ? value : Number(value);
    setItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById("invoice");
    setTimeout(() => {
      html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`${invoiceNo || "invoice"}.pdf`);
      });
    }, 500);
  };

  const handleSaveInvoice = async () => {
    const invoiceData = {
      invoiceNo,
      date: new Date(),
      customerName,
      customerAddress,
      telephone,
      email,
      paymentType,
      quotationNo,
      poNo: purchaseOrderNo,
      chequeNo: paymentType === "Check" ? chequeNo : undefined,
      chequeBank: paymentType === "Check" ? chequeBank : undefined,
      chequeDate: paymentType === "Check" ? chequeDate : undefined,
      items: items.map((item) => ({
        description: item.description,
        quantityType: item.unit,
        quantity: item.quantity,
        unitRate: item.unitPrice,
        unitAmount:
          item.quantity * item.unitPrice -
          (item.itemDiscount / 100) * item.quantity * item.unitPrice,
      })),
      total,
      discount: discountAmount,
      grandTotal,
      advance,
      balance,
    };

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    if (!token) {
        alert("Authentication error. Please log in again.");
        navigate('/login');
        return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(invoiceData),
      });

      if (res.status === 401) {
           localStorage.removeItem('userInfo');
           alert('Session expired. Please log in again.');
           navigate('/login');
           return;
      }

      if (res.ok) {
        const savedInvoice = await res.json();
        alert("✅ Invoice saved successfully! Now preparing dispatch note.");
        navigate(`/dispatch/${savedInvoice._id}`);
      } else {
        const errData = await res.json();
        alert("❌ Error saving invoice: " + (errData.error || "Unknown server error"));
      }
    } catch (err) {
      console.error("Failed to save invoice:", err);
      alert("❌ Failed to save invoice. Check console for errors.");
    }
  };

  return (
    <div className="form-container">
      <h2>Create Invoice</h2>

      <div className="form-grid">
        <div className="form-section">
          <h3>Customer Details</h3>
          <label>
            Customer Name:
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>
          <label>
            Telephone:
            <input
              type="text"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Required for SMS dispatch"
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label>
            Customer Address:
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              rows={4}
              placeholder="Optional"
            />
          </label>
        </div>

        <div className="form-section">
          <h3>Invoice Details</h3>
          <label>
            Payment Type:
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Credit">Credit</option>
              <option value="Check">Check</option>
              <option value="Online">Online</option>
            </select>
          </label>
          {paymentType === "Check" && (
            <>
              <label>
                Cheque No:
                <input
                  type="text"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  required
                />
              </label>
              <label>
                Bank:
                <input
                  type="text"
                  value={chequeBank}
                  onChange={(e) => setChequeBank(e.target.value)}
                  required
                />
              </label>
              <label>
                Cheque Date:
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  required
                />
              </label>
            </>
          )}
          <label>
            Quotation No:
            <input
              type="text"
              value={quotationNo}
              onChange={(e) => setQuotationNo(e.target.value)}
            />
          </label>
          <label>
            Purchase Order No:
            <input
              type="text"
              value={purchaseOrderNo}
              onChange={(e) => setPurchaseOrderNo(e.target.value)}
            />
          </label>
          <label>
            Invoice Date & Time:
            <input type="text" value={invoiceDateTime} readOnly />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Items</h3>
        <table className="items-entry-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Unit Price (Rs.)</th>
              <th>Item Discount (%)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td><input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)}/></td>
                <td>
                  <select value={item.unit} onChange={(e) => handleItemChange(index, "unit", e.target.value)}>
                    <option value="NOS">NOS</option>
                    <option value="meters">meters</option>
                    <option value="feet">feet</option>
                  </select>
                </td>
                <td><input type="number" step="0.01" min="0" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)} required style={{ textAlign: 'right' }} /></td>
                <td><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)} style={{ textAlign: 'right' }} /></td>
                <td><input type="number" min="0" max="100" step="0.01" value={item.itemDiscount} onChange={(e) => handleItemChange(index, "itemDiscount", parseFloat(e.target.value) || 0)} style={{ textAlign: 'right' }} /></td>
                <td><button type="button" className="remove-item-btn" onClick={() => handleRemoveItem(index)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="add-item-btn" onClick={addItem}>+ Add Item</button>
      </div>

      <div className="summary-grid">
        <div className="form-section">
          <h3>Summary</h3>
          <label>
            Overall Discount (%):
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Advance (Rs.):
            <input
              type="number"
              min="0"
              value={advance}
              onChange={(e) => setAdvance(Number(e.target.value))}
              disabled={paymentType === 'Cash'}
            />
          </label>
        </div>

        <div className="form-section">
          <h3>Totals</h3>
          <div className="totals-box">
            <p>
              <span>Subtotal:</span>
              <span>Rs. {total.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
            <p>
              <span>Discount:</span>
              <span>- Rs. {discountAmount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
            <p className="total-highlight">
              <span>Grand Total:</span>
              <span>Rs. {grandTotal.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
            <p>
              <span>Advance Paid:</span>
              <span>- Rs. {advance.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
            <p className="total-highlight">
              <span>Balance Due:</span>
              <span>Rs. {balance.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button type="button" className="btn-save" onClick={handleSaveInvoice}>💾 Save Invoice</button>
        <button type="button" className="btn-print" onClick={handlePrint}>🖨 Print Invoice</button>
        <button type="button" className="btn-download" onClick={handleDownloadPDF}>📄 Download as PDF</button>
      </div>

      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={componentRef}>
          <InvoicePreview
            customerName={customerName}
            customerAddress={customerAddress}
            telephone={telephone}
            email={email}
            quotationNo={quotationNo}
            purchaseOrderNo={purchaseOrderNo}
            items={items}
            total={total}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            advance={advance}
            balance={balance}
            invoiceNo={invoiceNo}
            date={invoiceDateTime}
            paymentType={paymentType}
            chequeNo={chequeNo}
            chequeBank={chequeBank}
            chequeDate={chequeDate}
          />
        </div>
      </div>

      <div className="invoice-preview-wrapper">
        <h3 style={{ textAlign: 'center' }}>Live Preview</h3>
        <div id="invoice">
          <InvoicePreview
            customerName={customerName}
            customerAddress={customerAddress}
            telephone={telephone}
            email={email}
            quotationNo={quotationNo}
            purchaseOrderNo={purchaseOrderNo}
            items={items}
            total={total}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            advance={advance}
            balance={balance}
            invoiceNo={invoiceNo}
            date={invoiceDateTime}
            paymentType={paymentType}
            chequeNo={chequeNo}
            chequeBank={chequeBank}
            chequeDate={chequeDate}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;