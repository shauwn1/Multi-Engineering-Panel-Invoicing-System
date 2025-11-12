import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import PaymentReceipt from "./PaymentReceipt.js";

const CreditPaymentForm = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [chequeNo, setChequeNo] = useState("");
  const [chequeBank, setChequeBank] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [lastPayment, setLastPayment] = useState(null);
  const receiptRef = useRef();

  const handleDownloadPDF = () => {
    const input = receiptRef.current;
    if (!input) return;
 
    setTimeout(() => {
      html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5'
        });
 
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth;
        let imgHeight = imgWidth / canvasRatio;
 
        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = imgHeight * canvasRatio;
        }
 
        const xOffset = (pdfWidth - imgWidth) / 2;
        const yOffset = (pdfHeight - imgHeight) / 2;
 
        pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);
        pdf.save(`Receipt-${invoice.invoiceNo}.pdf`);
      });
    }, 500); 
  };
 
  const handlePrintReceipt = useReactToPrint({
  contentRef: receiptRef,
});
 
  const formatCurrency = (amount) => {
    return `Rs. ${new Intl.NumberFormat("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo ? userInfo.token : null;

      if (!token) {
          navigate('/login');
          return;
      }

      const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      };

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/invoices/${invoiceId}`, { headers });
        
        if (res.status === 401) {
            localStorage.removeItem('userInfo');
            navigate('/login');
            return;
        }
        if (!res.ok) throw new Error("Invoice not found");
        
        const data = await res.json();
        setInvoice(data);
        setAmountPaid(data.balance);
      } catch (err) {
        console.error(err);
        setInvoice(false);
      }
    };
    fetchInvoice();
  }, [invoiceId, navigate]);

  const handleSavePayment = async () => {
    if (amountPaid <= 0 || amountPaid > invoice.balance) {
      alert("Invalid payment amount. Please enter a value between 0 and the balance due.");
      return;
    }
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    if (!token) {
        navigate('/login');
        return;
    }

    const paymentData = {
      invoiceId,
      amountPaid,
      paymentMethod,
      paymentDate: new Date(),
      chequeNo: paymentMethod === "Check" ? chequeNo : undefined,
      chequeBank: paymentMethod === "Check" ? chequeBank : undefined,
      chequeDate: paymentMethod === "Check" ? chequeDate : undefined,
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/payments`,{
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(paymentData),
      });

      if (res.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
          return;
      }

      if (res.ok) {
        const { payment, updatedInvoice } = await res.json();
        alert("✅ Payment saved successfully!");
        setLastPayment({ ...payment });
        setInvoice(updatedInvoice);
      } else {
        const errData = await res.json();
        alert(`❌ Error saving payment: ${errData.error || 'Unknown server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save payment.");
    }
  };

  if (invoice === null) return <p>Loading invoice details...</p>;
  if (invoice === false) return <p>Error: Could not load invoice.</p>;

  return (
    <div className="form-container">
      <h2>Payment for Invoice: {invoice.invoiceNo}</h2>
      <p style={{ textAlign: 'center', marginTop: '-20px', marginBottom: '30px', color: '#6c757d' }}>
        Customer: <strong>{invoice.customerName}</strong>
      </p>

      <div className="payment-details-box">
        <div className="detail-row">
          <span>Grand Total:</span>
          <span>{formatCurrency(invoice.grandTotal)}</span>
        </div>
        <div className="detail-row">
          <span>Previously Paid:</span>
          <span>{formatCurrency(invoice.advance)}</span>
        </div>
        <div className="detail-row balance-due-row">
          <span>Balance Due:</span>
          <span>{formatCurrency(invoice.balance)}</span>
        </div>
      </div>

      <div className="payment-form-section">
        <h3>Enter Payment Details</h3>
        <label>
          Payment Amount (Rs.):
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
            max={invoice.balance}
            min="0"
            disabled={!!lastPayment}
          />
        </label>

        <label>
          Payment Method:
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={!!lastPayment}>
            <option value="Cash">Cash 💵</option>
            <option value="Check">Check 🏦</option>
            <option value="Online">Online 💻</option>
          </select>
        </label>

        {paymentMethod === "Check" && (
          <>
            <label>Cheque No: <input type="text" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} required disabled={!!lastPayment} /></label>
            <label>Bank: <input type="text" value={chequeBank} onChange={(e) => setChequeBank(e.target.value)} required disabled={!!lastPayment} /></label>
            <label>Cheque Date: <input type="date" value={chequeDate} onChange={(e) => setChequeDate(e.target.value)} required disabled={!!lastPayment} /></label>
          </>
        )}
      </div>

      <div className="action-buttons">
        <button type="button" onClick={handleSavePayment} disabled={!!lastPayment} className="btn-submit">
          💾 Submit Payment
        </button>

        {lastPayment && (
          <>
            <button type="button" onClick={handlePrintReceipt} className="btn-print">
              🖨️ Print Receipt
            </button>
            
            <button type="button" onClick={handleDownloadPDF} className="btn-download">
              📄 Download PDF
            </button>

            <button type="button" onClick={() => navigate("/credit")} className="btn-back">
              ⬅️ Back to List
            </button>
          </>
        )}
      </div>

      <div style={{ position: "absolute", left: "-9999px" }}>
        <PaymentReceipt ref={receiptRef} invoice={invoice} paymentDetails={lastPayment} />
      </div>
    </div>
  );
};
export default CreditPaymentForm;