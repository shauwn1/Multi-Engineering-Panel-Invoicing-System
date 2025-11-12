import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";
import InvoicePreview from './InvoicePreview.js';

const InvoiceDetailView = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef();
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);

    useEffect(() => {
        const fetchInvoiceData = async () => {
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
                const invoiceRes = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, { headers });
                const historyRes = await fetch(`http://localhost:5000/api/payments/history/${invoiceId}`, { headers });

                if (invoiceRes.status === 401 || historyRes.status === 401) {
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                    return;
                }
                
                if (!invoiceRes.ok) throw new Error("Invoice not found");
                if (!historyRes.ok) throw new Error("Payment history not found");

                const invoiceData = await invoiceRes.json();
                const historyData = await historyRes.json();
                
                setInvoice(invoiceData);
                setPaymentHistory(historyData);

            } catch (err) {
                console.error(err);
                setInvoice(false);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceData();
    }, [invoiceId, navigate]);

    const handlePrint = useReactToPrint({ contentRef: componentRef });

    const handleDownloadPDF = () => {
        const input = componentRef.current;
        setTimeout(() => {
          html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${invoice.invoiceNo || "invoice"}.pdf`);
          });
        }, 500);
      };

    if (loading) return <p>Loading invoice...</p>;
    if (!invoice) return <p>Invoice not found. <Link to="/invoices">Go back</Link></p>;

    return (
        <div className="form-container">
            <div className="action-buttons" style={{ justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <Link to="/invoices">
                    <button className="btn-back">⬅️ Back to All Invoices</button>
                </Link>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0', marginTop: '10px' }}>
                        <input
                            type="checkbox"
                            style={{ width: 'auto', height: 'auto', marginTop: '0' }}
                            checked={showPaymentHistory}
                            onChange={(e) => setShowPaymentHistory(e.target.checked)}
                        />
                        Show Payment History
                    </label>
                    
                    <div>
                        <button onClick={handlePrint} className="btn-print">🖨️ Print Invoice</button>
                        <button onClick={handleDownloadPDF} className="btn-download">📄 Download PDF</button>
                    </div>
                </div>
            </div>

            <div ref={componentRef}>
                <InvoicePreview
                    customerName={invoice.customerName}
                    customerAddress={invoice.customerAddress}
                    telephone={invoice.telephone}
                    email={invoice.email}
                    quotationNo={invoice.quotationNo}
                    purchaseOrderNo={invoice.poNo}
                    items={invoice.items.map(item => ({
                        ...item, 
                        unitPrice: item.unitRate,
                        itemDiscount: item.itemDiscount || 0
                    }))}
                    total={invoice.total}
                    discountAmount={invoice.discount}
                    grandTotal={invoice.grandTotal}
                    advance={invoice.advance}
                    balance={invoice.balance}
                    invoiceNo={invoice.invoiceNo}
                    date={new Date(invoice.date).toLocaleString()}
                    paymentType={invoice.paymentType}
                    chequeNo={invoice.chequeNo}
                    chequeBank={invoice.chequeBank}
                    chequeDate={invoice.chequeDate ? new Date(invoice.chequeDate).toLocaleDateString() : ''}
                    paymentHistory={paymentHistory}
                    showPaymentHistory={showPaymentHistory}
                />
            </div>
        </div>
    );
};

export default InvoiceDetailView;