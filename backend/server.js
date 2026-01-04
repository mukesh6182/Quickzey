require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors=require('cors');

require('./utils/Passport'); 
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes'); 
const storeRoutes = require('./routes/storeRoutes');

const app = express();
// Middleware
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
        .then(()=>{console.log("Database Connected Successfully !!!");
        }).catch((err)=>{console.log(`Error : ${err}`);
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(cors({    
    origin: [ "http://localhost:4200", "http://127.0.0.1:4200"],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
}));


// Routes
app.use('/auth', authRoutes);
app.use('/store',storeRoutes);
app.use('/admin',adminRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server running at : http://localhost:${PORT}`);        
});