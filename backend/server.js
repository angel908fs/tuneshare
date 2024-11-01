const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const connectToDB = require('./config/db.js');
const userAuthenticationRoutes = require('./routes/login.js');
const defaultRoute = require('./routes/default_route.js');
<<<<<<< HEAD
const invalidRoutes = require('./routes/invalid_routes.js')
const accountCreation = require('./routes/account_creation.js')
const follow = require('./routes/follow_route.js')

=======
const invalidRoutes = require('./routes/invalid_routes.js');
const accountCreation = require('./routes/signup.js')
const spotifyRoutes = require('./routes/spotify_routes.js'); // import spotify routes
>>>>>>> 74b8c1e62ba2b2ef1726a4db3608ec143addb12f

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
app.use('/api/auth',accountCreation); // signup
app.use(userAuthenticationRoutes); // login
<<<<<<< HEAD
app.use(defaultRoute);
app.use(follow);
app.use(invalidRoutes); // THIS HAS TO STAY LAST

=======
app.use(spotifyRoutes);
app.use(userAuthenticationRoutes);
app.use(defaultRoute);

app.use(invalidRoutes); // THIS HAS TO STAY LAST
>>>>>>> 74b8c1e62ba2b2ef1726a4db3608ec143addb12f

// database connection
connectToDB();

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
