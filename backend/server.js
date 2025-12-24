const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const app=express();

const MONGO_URI=process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
        .then(()=>{console.log("Database Connected Successfully !!!");
    }).catch((err)=>{console.log(`Error : ${err}`);
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`Server running at : http://localhost:${PORT}`);        
});