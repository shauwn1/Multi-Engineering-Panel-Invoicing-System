import React from "react";
import "./InvoicePreview.css";
import Logo from "../assets/logo.png";

const InvoicePreview = ({
  customerName,
  customerAddress,
  telephone,
  email,
  quotationNo,
  purchaseOrderNo,
  items,
  total,
  discountAmount,
  grandTotal,
  advance,
  balance,
  invoiceNo,
  date,
  paymentType,
  chequeNo,
  chequeBank,
  chequeDate,
  paymentHistory = [],
  showPaymentHistory,
}) => {
  return (
    <div className="invoice-preview">
      <div className="invoice-content">
        <div className="invoice-header">
          <img
            src={Logo}
            alt="Company Logo"
            style={{ height: "80px", marginRight: "20px" }}
          />
          <div style={{ textAlign: "left" }}>
            <h2 style={{ margin: 5 }}>
              Multi Engineering Services Lanka (Pvt) Ltd
            </h2>
            <p style={{ margin: 5 }}>
              No. 466/7A, Thapowanaya Road, Aggona, Angoda
            </p>
            <p style={{ margin: 5 }}>
              Tel: 4558559 | Fax: 2793291 | Hotline: 071-7791772
            </p>
          </div>
        </div>

        <h1 className="invoice-title">Invoice</h1>

        <table className="invoice-details">
          <tbody>
            <tr>
              <td className="label">Invoice No:</td>
              <td className="value">{invoiceNo}</td>
              <td className="label">Quotation No:</td>
              <td className="value">{quotationNo || "-"}</td>
            </tr>
            <tr>
              <td className="label">Date & Time:</td>
              <td className="value">{date}</td>
              <td className="label">PO No:</td>
              <td className="value">{purchaseOrderNo || "-"}</td>
            </tr>
            <tr>
              <td className="label">Customer Name:</td>
              <td className="value">{customerName}</td>
              <td className="label">Payment Type:</td>
              <td className="value">{paymentType || "-"}</td>
            </tr>
            {paymentType === "Check" && (
              <tr>
                <td className="label">Cheque Details:</td>
                <td className="value" colSpan={3}>
                  {chequeNo} - {chequeBank} ({chequeDate})
                </td>
              </tr>
            )}
            <tr>
              <td className="label">Address:</td>
              <td className="value">{customerAddress}</td>
              <td className="label">Email:</td>
              <td className="value">{email}</td>
            </tr>
            <tr>
              <td className="label">Telephone:</td>
              <td className="value">{telephone}</td>
              <td className="label"></td>
              <td className="value"></td>
            </tr>
          </tbody>
        </table>

        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: "2%" }}>No.</th>
              <th style={{ width: "40%" }}>Description</th>
              <th style={{ width: "5%" }}>Unit</th>
              <th style={{ width: "5%" }}>Qty</th>
              <th style={{ width: "15%" }}>Unit Price (Rs.)</th>
              <th style={{ width: "5%" }}>Item Discount (%)</th>
              <th style={{ width: "10%" }}>Disc. Unit Price (Rs.)</th>
              <th style={{ width: "15%" }}>Total (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemTotal = item.quantity * item.unitPrice;
              const discountAmt = (item.itemDiscount / 100) * itemTotal;
              const lineTotal = itemTotal - discountAmt;
              const discountedUnitPrice =
                item.unitPrice - (item.unitPrice * item.itemDiscount) / 100;

              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td style={{ textAlign: "left" }}>{item.description}</td>
                  <td>{item.unit || item.quantityType}</td>
                  <td>{item.quantity.toFixed(2)}</td>
                  <td>
                    {item.unitPrice.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>{item.itemDiscount?.toFixed(2) || "0.00"}</td>
                  <td>
                    {discountedUnitPrice.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {lineTotal.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="invoice-footer">
        <hr className="footer-rule" />
        </div>

      {/* --- START OF REBUILT FOOTER --- */}
      <div className="invoice-footer">
        {/* Row 1: Totals */}
        <div className="totals-container">
          <div className="totals-left">
            <div className="totals-line">
              <span>Total Items:</span>
              <span>{items.length}</span>
            </div>
            <div className="totals-line">
              <span>Total Paid / Advance:</span>
              <span>
                {advance.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="totals-line">
              <span>Balance Payment:</span>
              <span>
                {balance.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          <div className="totals-right">
            <div className="totals-line">
              <span>Sub Total:</span>
              <span>
                {total.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="totals-line">
              <span>Discount:</span>
              <span>
                ({discountAmount.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })})
              </span>
            </div>
            <div className="totals-line grand-total">
              <span>Total:</span>
              <span>
                {grandTotal.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History (Kept from your original code) */}
        {showPaymentHistory && paymentHistory && paymentHistory.length > 0 && (
          <div className="payment-history-section">
            <h3 className="history-title">Payment History</h3>
            <table className="payment-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Receipt No</th>
                  <th>Payment Method</th>
                  <th>Amount Paid (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment._id}>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>{payment.receiptNo}</td>
                    <td>{payment.paymentMethod}</td>
                    <td style={{ textAlign: "right" }}>
                      {payment.amountPaid.toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Row 2: Notes & Signatures */}
        <div className="footer-bottom-container">
          <div className="footer-notes">
            <p>
              Your Total Discount is{" "}
              {discountAmount.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
              })}
              .
            </p>
            <p style={{ marginTop: '5px' }}>Note:</p>
            <ul className="notes-list">
              <li>We certify invoice information true and correct.</li>
              <li>
                Please check purchased goods are according to invoice details,
                before leave sales counter.
              </li>
              <li>
                Goods exchange allow only for not used and with factory packing.
              </li>
              <li>
                (electronic goods exchange not allowed) After 14 days exchange
                not allowed.
              </li>
            </ul>
          </div>
          <div className="footer-signatures">
            
            {/* This new div holds the signatures horizontally */}
            <div className="signature-line">
              <div className="signature-block">
                <p>........................</p>
                <p>Checked By</p>
              </div>
              <div className="signature-block">
                <p>........................</p>
                <p>Received</p>
              </div>
            </div>
            
            {/* The system note is outside the signature-line div */}
            <p className="system-note">SYSTEM BY Rock Ishan max</p>
          
          </div>
        </div>
      </div>
      {/* --- END OF REBUILT FOOTER --- */}
    </div>
  );
};

export default InvoicePreview;