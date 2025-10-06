// import libaries
const express =require('express');   

// import cors middleware
const cors=require('cors');

// importing routes
const offerRoutes=require('./routes/offer.routes');  
const leadsRoutes=require('./routes/leads.routes');
const scoreRoutes=require('./routes/score.routes');

// app initialization
const app = express();
app.use(express.json());
app.use(cors());

// routes middleware
app.use('/api/offer',offerRoutes);  
app.use('/api/leads',leadsRoutes);
app.use('/api/score', scoreRoutes);

module.exports = app;