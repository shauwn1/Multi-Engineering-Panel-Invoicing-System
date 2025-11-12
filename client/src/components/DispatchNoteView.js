// client/src/components/DispatchNoteView.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
// 👇 1. Import useNavigate
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";
import DispatchNotePreview from './DispatchNotePreview.js';

const DispatchNoteView = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate(); // 👈 2. Initialize navigate
    const [invoice, setInvoice] = useState(null);
    const [dispatchNote, setDispatchNote] = useState(null);
    const [specialNote, setSpecialNote] = useState("");
    const [loading, setLoading] = useState(true);
    const componentRef = useRef();

    const fetchDispatchData = useCallback(async () => {
        // 👇 3. Get token from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : null;

        if (!token) {
            navigate('/login');
            return;
        }
        
        // 👇 4. Create headers object
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        try {
            const [invoiceRes, dispatchRes] = await Promise.all([
                // 👇 5. Add headers to fetch
                fetch(`http://localhost:5000/api/invoices/${invoiceId}`, { headers }),
                fetch(`http://localhost:5000/api/dispatch/by-invoice/${invoiceId}`, { headers })
            ]);

            // 👇 6. Add error handling for BOTH requests
            if (invoiceRes.status === 401 || dispatchRes.status === 401) {
                localStorage.removeItem('userInfo');
                navigate('/login');
                return;
            }

            if (!invoiceRes.ok) {
                throw new Error(`Failed to fetch invoice: ${invoiceRes.statusText}`);
            }
            if (!dispatchRes.ok) {
                // This isn't a critical error, just log it
                console.warn(`Could not find existing dispatch note: ${dispatchRes.statusText}`);
            }
            
            const invoiceData = await invoiceRes.json();
            const dispatchData = await dispatchRes.json(); // This will be null if 404, which is fine

            setInvoice(invoiceData);
            if (dispatchData) {
                setDispatchNote(dispatchData);
                setSpecialNote(dispatchData.specialNote);
            }
        } catch (err) {
            console.error(err);
            setInvoice(false); // 👈 Set to false to trigger "Invoice not found"
        } finally {
            setLoading(false);
        }
    }, [invoiceId, navigate]); // 👈 7. Add navigate to dependency array

    useEffect(() => {
        fetchDispatchData();
    }, [fetchDispatchData]);

    const handleSave = async () => {
        // 👇 8. Get token for the SAVE operation too
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : null;

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/dispatch`, {
                method: 'POST',
                // 👇 9. Add headers to save
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ invoiceId, specialNote }),
            });

            if (res.status === 401) {
                localStorage.removeItem('userInfo');
                navigate('/login');
                return;
            }

            if (res.ok) {
                alert('✅ Dispatch Note saved successfully!');
                fetchDispatchData(); // Refresh data to get the new DN number
            } else {
                alert('❌ Error saving dispatch note.');
            }
        } catch (err) {
            console.error(err);
        }
    };
    
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

    if (loading) return <p>Loading dispatch note...</p>;
    // 👇 This check will now correctly catch errors
    if (!invoice) return <p>Invoice not found.</p>; 

    return (
        <div className="form-container">
            <div className="action-buttons" style={{ justifyContent: 'space-between', marginBottom: '20px' }}>
                <Link to="/invoices"><button className="btn-back">⬅️ All Invoices</button></Link>
                <div>
                    <button onClick={handleSave} className="btn-submit">💾 Save Note</button>
                    <button onClick={handlePrint} className="btn-print">🖨️ Print</button>
                    <button onClick={handleDownloadPDF} className="btn-download">📄 Download PDF</button>
                </div>
            </div>

            <label>
                Special Note (for internal use or customer instructions):
                <textarea 
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    rows={4}
                    placeholder="e.g., Deliver to side entrance. Contact Mr. Silva on arrival."
                />
            </label>

            <DispatchNotePreview 
                ref={componentRef}
                invoice={invoice}
                dispatchNote={dispatchNote}
                specialNote={specialNote}
            />
        </div>
    );
};

export default DispatchNoteView;