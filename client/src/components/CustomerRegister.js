import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Re-use login styles

const CustomerRegister = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', password: '', name: '', phone: '', address: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem('userInfo', JSON.stringify(data));
            setIsAuthenticated(true);
            navigate('/customer-dashboard');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleRegister} className="login-form">
                <h2>Customer Registration</h2>
                <div className="form-group">
                    <label>Username (Login ID)</label>
                    <input name="username" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Full Name</label>
                    <input name="name" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Phone (Used to link invoices)</label>
                    <input name="phone" onChange={handleChange} required placeholder="077xxxxxxx" />
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <input name="address" onChange={handleChange} />
                </div>
                <button type="submit" className="login-button">Register</button>
                <p style={{marginTop: '15px'}}>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </form>
        </div>
    );
};

export default CustomerRegister;