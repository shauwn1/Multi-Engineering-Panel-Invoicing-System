import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMoneyBillWave } from 'react-icons/fa';
import './creditInvoicesList.css';

const CreditInvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatCurrency = (amount) => new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR"
  }).format(amount);

  useEffect(() => {
    const fetchCreditInvoices = async () => {
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
        const res = await fetch("http://localhost:5000/api/invoices/credit", { headers });
        
        if (res.status === 401) {
            localStorage.removeItem('userInfo');
            navigate('/login');
            return;
        }
        
        if (!res.ok) {
           throw new Error('Failed to fetch credit invoices');
        }

        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error("Failed to fetch credit invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreditInvoices();
  }, [navigate]);

  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balance, 0);

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Outstanding Credit Invoices</h2>
        <div className="total-outstanding-box">
          <span>Total Outstanding:</span>
          <strong>{formatCurrency(totalOutstanding)}</strong>
        </div>
      </div>

      {loading ? (
        <p>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p className="no-data-message">No outstanding credit invoices found.</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer Name</th>
              <th>Date</th>
              <th>Balance Due</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td>{inv.invoiceNo}</td>
                <td>{inv.customerName}</td>
                <td>{new Date(inv.date).toLocaleDateString()}</td>
                <td className="amount-cell">{formatCurrency(inv.balance)}</td>
                <td className="action-cell">
                  <Link to={`/pay/${inv._id}`}>
                    <button className="btn-pay">
                      <FaMoneyBillWave /> Make Payment
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CreditInvoicesList;