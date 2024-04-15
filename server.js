const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const airoutes = require('./routes/airoutes');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(express.json());
app.use(cors({
  origin: ['https://jolix.onrender.com', 'http://localhost:3000'], 
  credentials: true,
}));

  
app.use('/api', airoutes);

app.listen(10000, () => {
    console.log('Server is running on port 10000');
});
