require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const path = require('path');

require('./utils/Passport'); 
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/managerRoutes');
const authRoutes = require('./routes/authRoutes'); 
const storeRoutes = require('./routes/storeRoutes');
const addressRoutes = require('./routes/addressRoutes');
const customerRoutes = require('./routes/customerRoutes');
const partnerRoutes= require('./routes/partnerRoutes');
const app = express();


const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Database Connected Successfully !!!");
    })
    .catch((err) => {
        console.log(`Error : ${err}`);
    });

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON body
app.use(passport.initialize());

// Enable CORS for the frontend
app.use(cors({
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/store', storeRoutes);
app.use('/admin', adminRoutes);
app.use('/address', addressRoutes);
app.use('/manager',managerRoutes);
app.use('/customer',customerRoutes);
app.use('/delivery',partnerRoutes);
// Default route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at : http://localhost:${PORT}`);
});
