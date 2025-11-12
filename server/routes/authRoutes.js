// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure JWT_SECRET is in your .env

// Helper function to generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// 🔑 POST /api/auth/login - User Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

// 👤 (Optional) POST /api/auth/register - Create Admin User (Run once manually or via a script)
// In a real app, you might remove this or protect it.
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const user = await User.create({ username, password });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id), // Optionally log in immediately
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

module.exports = router;