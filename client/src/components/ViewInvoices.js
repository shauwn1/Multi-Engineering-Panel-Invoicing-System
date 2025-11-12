import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFileInvoice, FaTruck, FaSearch, FaRedo } from 'react-icons/fa';
import './viewInvoices.css';

const formatCurrency = (amount) => new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR"
}).format(amount);

const getStatusBadge = (invoice) => {
  if (invoice.balance <= 0) {
    return <span className="status-badge status-paid">Paid</span>;
  }
  if (invoice.advance > 0 && invoice.balance > 0) {
    return <span className="status-badge status-partial">Partially Paid</span>;
  }
  return <span className="status-badge status-unpaid">Unpaid</span>;
};

const ViewInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentType, setPaymentType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  
  const navigate = useNavigate();

  useEffect(() => {
      const handler = setTimeout(() => {
          setDebouncedSearch(searchTerm);
      }, 500); 
      return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    
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

    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (paymentType && paymentType !== 'All') params.append('paymentType', paymentType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    try {
      const res = await fetch(`http://localhost:5000/api/invoices?${params.toString()}`, { headers });

      if (res.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
          return;
      }
      if (!res.ok) throw new Error('Failed to fetch invoices');

      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, paymentType, startDate, endDate, navigate]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setPaymentType("All");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>All Invoices</h2>
      </div>

      <div className="filter-bar">
        <div className="filter-group search-filter">
          <FaSearch className="filter-icon" />
          <input
            type="text"
            placeholder="Search Invoice # or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search"
          />
        </div>
        <div className="filter-group">
          <label>Type:</label>
          <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
            <option value="All">All Payment Types</option>
            <option value="Cash">Cash</option>
            <option value="Credit">Credit</option>
            <option value="Check">Check</option>
            <option value="Online">Online</option>
          </select>
        </div>
        <div className="filter-group">
          <label>From:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>To:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button onClick={handleResetFilters} className="btn-reset">
          <FaRedo /> Reset
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Customer Name</th>
            <th>Date</th>
            <th>Grand Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="6" className="loading-cell">Loading...</td></tr>
          ) : invoices.length > 0 ? (
            invoices.map((inv) => (
              <tr key={inv._id}>
                <td>{inv.invoiceNo}</td>
                <td>{inv.customerName}</td>
                <td>{new Date(inv.date).toLocaleDateString()}</td>
                <td className="amount-cell">{formatCurrency(inv.grandTotal)}</td>
                <td className="status-cell">{getStatusBadge(inv)}</td>
                <td className="actions-cell">
                  <Link to={`/invoices/${inv._id}`} className="btn-action btn-view">
                    <FaFileInvoice /> Invoice
                  </Link>
                  {inv.hasDispatchNote && (
                    <Link to={`/dispatch/${inv._id}`} className="btn-action btn-dispatch">
                      <FaTruck /> Dispatch
                    </Link>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="no-data-message">No invoices found matching your filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewInvoices;