import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import InvoiceForm from "./components/invoiceForm.js";
import CreditInvoicesList from "./components/CreditInvoicesList.js";
import CreditPaymentForm from "./components/CreditPaymentForm.js";
import ViewInvoices from "./components/ViewInvoices.js";
import InvoiceDetailView from "./components/InvoiceDetailView.js";
import DispatchNoteView from "./components/DispatchNoteView.js";
import Dashboard from './components/Dashboard.js';
import Login from "./components/Login.js";
import Logo from './assets/logo.png';
import './App.css';
import { 
  FaTachometerAlt, 
  FaPlusSquare, 
  FaCreditCard, 
  FaFileAlt, 
  FaSignOutAlt 
} from 'react-icons/fa';
import CustomerRegister from "./components/CustomerRegister.js";
import CustomerDashboard from "./components/CustomerDashboard.js";

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('userInfo'));

  // Helper to check role
  const getUserRole = () => {
    const info = localStorage.getItem('userInfo');
    return info ? JSON.parse(info).role : null;
  };

  const role = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<CustomerRegister setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // CUSTOMER LAYOUT
  if (role === 'customer') {
     return (
        <BrowserRouter>
            <Routes>
                <Route 
  path="/customer-dashboard" 
  element={<CustomerDashboard onLogout={handleLogout} />} 
/>
                <Route path="*" element={<Navigate to="/customer-dashboard" replace />} />
            </Routes>
        </BrowserRouter>
     );
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="sidebar-nav">
          <div className="sidebar-header">
            <img src={Logo} alt="Company Logo" />
            <h2>MESL Invoice</h2>
          </div>
          <div className="nav-links">
            <NavLink to="/"><FaTachometerAlt /> Dashboard</NavLink>
            <NavLink to="/create"><FaPlusSquare /> Create Invoice</NavLink>
            <NavLink to="/credit"><FaCreditCard /> Credit Payments</NavLink>
            <NavLink to="/invoices"><FaFileAlt /> View All Invoices</NavLink>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> Logout
          </button>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<InvoiceForm />} />
            <Route path="/credit" element={<CreditInvoicesList />} />
            <Route path="/pay/:invoiceId" element={<CreditPaymentForm />} />
            <Route path="/invoices" element={<ViewInvoices />} />
            <Route path="/invoices/:invoiceId" element={<InvoiceDetailView />} />
            <Route path="/dispatch/:invoiceId" element={<DispatchNoteView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;