const express = require('express');
const router = express.Router();
const User = require('../model/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//signup route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
            });
        // Save user to database
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
   
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
        res.json({ token });
     } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
        });
module.exports = router;
// Export the router
