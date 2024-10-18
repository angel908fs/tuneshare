import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import connectToDB from './config/db.js';

dotenv.config();
const PORT = 8080;
const HOST = "localhost";
const app = express();

// middleware
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'  // Frontend URL
}));

// database connection
connectToDB();

app.get('/', (req, res) => {
  res.send('TuneShare is running...');
});

// start server
app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`)
});