const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const airoutes = require('./routes/airoutes');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/jolix', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to match your front-end URL
    credentials: true,
  }));

  
app.use('/api', airoutes);

app.listen(10000, () => {
    console.log('Server is running on port 10000');
});
