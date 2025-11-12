import React from 'react';
import './DispatchNotePreview.css';
import Logo from "../assets/logo.png";

const DispatchNotePreview = React.forwardRef(({ invoice, dispatchNote, specialNote }, ref) => {
    
    if (!invoice) return <div ref={ref}>Loading...</div>;

    return (
        <div className="dispatch-preview" ref={ref}>
            <div className="dispatch-header">
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

            <h1 className="dispatch-title">Dispatch Note</h1>

            <table className="dispatch-details">
                <tbody>
                    <tr>
                        <td className="label">Dispatch No:</td>
                        <td className="value">{dispatchNote?.dispatchNo || 'N/A'}</td>
                        <td className="label">Invoice No:</td>
                        <td className="value">{invoice.invoiceNo}</td>
                    </tr>
                    <tr>
                        <td className="label">Date:</td>
                        <td className="value">{new Date(dispatchNote?.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="label">Customer:</td>
                        <td className="value">{invoice.customerName}</td>
                    </tr>
                    <tr>
                        <td className="label">Dispatch Address:</td>
                        <td className="value" colSpan={3}>
                            {invoice.customerAddress || 'N/A'}
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className="dispatch-items-table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Description</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td style={{ textAlign: "left" }}>{item.description}</td>
                            <td>{item.quantity.toFixed(2)} {item.quantityType}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="dispatch-note-section">
                <p className="label">Special Note:</p>
                <p className="value">{specialNote || 'No special instructions.'}</p>
            </div>

            <div className="dispatch-footer">
                <div className="dispatch-footer-block">
                    <p>_ _ _ _ _ _ _ _ _ _ _ _</p>
                    <p>Prepared By</p>
                </div>
                <div className="dispatch-footer-block">
                    <p>_ _ _ _ _ _ _ _ _ _ _ _</p>
                    <p>Received By (Customer)</p>
                </div>
            </div>
        </div>
    );
});

export default DispatchNotePreview;