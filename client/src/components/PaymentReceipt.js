// client/src/components/PaymentReceipt.js
import React from "react";
import "./PaymentReceipt.css"; // We will create this next
import Logo from "../assets/logo.png";

const PaymentReceipt = React.forwardRef(({ invoice, paymentDetails }, ref) => {
  // Don't render if data isn't ready
  if (!invoice || !paymentDetails) {
    return null;
  }

  // The 'invoice' prop already contains the updated balance from the server
  const newBalance = invoice.balance;
  const previousBalance = newBalance + paymentDetails.amountPaid;

  return (
    <div className="receipt-preview" ref={ref}>
      {/* Company Header */}
      <div className="receipt-header">
        <img src={Logo} alt="Company Logo" style={{ height: "60px", marginRight: "20px" }} />
        <div>
          <h2 style={{ margin: 0 }}>Multi Engineering Services Lanka (Pvt) Ltd</h2>
          <p style={{ margin: "2px 0", fontSize: "12px" }}>
            No. 466/7A, Thapowanaya Road, Aggona, Angoda
          </p>
          <p style={{ margin: "2px 0", fontSize: "12px" }}>
            Tel: 4558559 | Fax: 2793291 | Hotline: 071-7791772
          </p>
        </div>
      </div>

      <h1 className="receipt-title">Payment Receipt</h1>

      {/* Receipt & Customer Details */}
      <table className="receipt-details">
        <tbody>
          <tr>
            <td className="label">Receipt No:</td>
            <td className="value">{paymentDetails.receiptNo}</td> 
            <td className="label">Payment Date:</td>
            <td className="value">{new Date(paymentDetails.paymentDate).toLocaleString()}</td>
          </tr>
          <tr>
            <td className="label">Original Invoice:</td>
            <td className="value">{invoice.invoiceNo}</td>
            <td className="label">Customer Name:</td>
            <td className="value">{invoice.customerName}</td>
          </tr>
        </tbody>
      </table>

      {/* Financial Summary */}
      <table className="financial-summary">
        <tbody>
          <tr>
            <td className="label">Previous Balance:</td>
            <td className="amount">Rs. {previousBalance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td className="label">Amount Received ({paymentDetails.paymentMethod}):</td>
            <td className="amount">
              - Rs. {paymentDetails.amountPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </td>
          </tr>
          {paymentDetails.paymentMethod === "Check" && (
             <tr>
                <td className="label" style={{paddingLeft: '25px', fontSize: '12px'}}>Cheque Details:</td>
                <td className="value" style={{fontSize: '12px'}}>{paymentDetails.chequeNo} ({paymentDetails.chequeBank})</td>
            </tr>
          )}
          <tr className="balance-row">
            <td className="label">New Balance Due:</td>
            <td className="amount">Rs. {newBalance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="receipt-footer">
        <p className="footer-note">Thank you for your payment!</p>
        <div className="signature-block">
          <p>_ _ _ _ _ _ _ _ _ _ _ _</p>
          <p>Authorized Signature</p>
        </div>
      </div>
    </div>
  );
});

export default PaymentReceipt;