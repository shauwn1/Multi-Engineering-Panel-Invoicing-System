import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './viewInvoices.css'; // Re-use existing table styles

const CustomerDashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const formatCurrency = (amount) => new Intl.NumberFormat("en-LK", {
        style: "currency", currency: "LKR"
    }).format(amount);

    useEffect(() => {
        const fetchMyInvoices = async () => {
            if (!userInfo) return navigate('/login');
            
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/invoices/my-invoices`, {
                    headers: { "Authorization": `Bearer ${userInfo.token}` }
                });
                if (res.status === 401) {
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                }
                const data = await res.json();
                setInvoices(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyInvoices();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    return (
        <div className="list-container" style={{ marginTop: '40px' }}>
            <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h2>My Invoices</h2>
                    <p>Welcome, {userInfo?.name}</p>
                </div>
                <button 
        onClick={onLogout} // Use the prop instead of a local function
        className="btn-reset" 
        style={{backgroundColor: '#dc3545', color: 'white'}}
    >
        Logout
    </button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Invoice No</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Balance Due</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" style={{textAlign: 'center'}}>Loading...</td></tr>
                    ) : invoices.length === 0 ? (
                        <tr><td colSpan="5" style={{textAlign: 'center'}}>No invoices found linked to your account.</td></tr>
                    ) : (
                        invoices.map(inv => (
                            <tr key={inv._id}>
                                <td>{inv.invoiceNo}</td>
                                <td>{new Date(inv.date).toLocaleDateString()}</td>
                                <td className="amount-cell">{formatCurrency(inv.grandTotal)}</td>
                                <td className="amount-cell" style={{color: inv.balance > 0 ? 'red' : 'green'}}>
                                    {formatCurrency(inv.balance)}
                                </td>
                                <td>
                                    {inv.balance <= 0 ? <span className="status-badge status-paid">Paid</span> : 
                                     <span className="status-badge status-unpaid">Unpaid</span>}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerDashboard;