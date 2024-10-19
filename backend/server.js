const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const connectToDB = require('./config/db.js');
const userAuthenticationRoutes = require('./routes/user_authentication.js');
const defaultRoute = require('./routes/default_route.js');
const invalidRoutes = require('./routes/invalid_routes.js')

dotenv.config();
const PORT = 8080;
const HOST = "localhost";
const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'  // Frontend URL
}));

// routes
app.use(defaultRoute);
app.use(invalidRoutes)
app.use(userAuthenticationRoutes);

// database connection
connectToDB();

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
