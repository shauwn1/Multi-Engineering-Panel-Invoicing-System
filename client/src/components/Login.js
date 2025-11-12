// client/src/components/Login.js
import React, { useState } from 'react';
import './Login.css'; // We'll create this next

// Pass setIsAuthenticated function down as a prop
const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Login failed');
            }

            const data = await res.json();
            
            // Store token and user info (e.g., in localStorage)
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            // Update authentication state in App component
            setIsAuthenticated(true); 
            // No need to navigate here, App component will handle redirection

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Admin Login</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};

export default Login;