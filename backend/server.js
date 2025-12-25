require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
require('./utils/Passport'); 

const authRoutes = require('./routes/authRoutes'); 

const app = express();

// Middleware

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
        .then(()=>{console.log("Database Connected Successfully !!!");
        }).catch((err)=>{console.log(`Error : ${err}`);
});
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server running at : http://localhost:${PORT}`);        
});