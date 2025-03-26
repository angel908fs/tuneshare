//import connect from './database/conn.js';

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
//const cloudinary = require("cloudinary").v2;
const Multer = require("multer");

const connectToDB = require('./config/db.js');

const loginRoutes = require('./routes/login.js');
const defaultRoute = require('./routes/default_route.js');
const invalidRoutes = require('./routes/invalid_routes.js');
const accountCreation = require('./routes/signup.js');
const spotifyRoutes = require('./routes/spotify_routes.js'); // import spotify routes
const LogOutRoute = require('./routes/logout.js');
const loadFeedRoutes = require('./routes/feed.js');
const followUserRoutes = require('./routes/follow_route.js');
const createPostRoutes = require('./routes/post_creation.js');
const profileRoutes = require('./routes/profile.js');
const userSearchRoutes = require('./routes/user_search.js')
const likesRoutes = require('./routes/likes.js');
const deezerRoutes = require('./routes/deezer.js');
const commentsRoutes = require('./routes/comments.js');
const User = require('./models/user.js');

dotenv.config();
const PORT = 8080;
const HOST = "localhost";
const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],   // Allow both frontend ports
    credentials:true,
}));
 const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});

// routes, /api' connects to the vite config, do not remove
app.use('/api',accountCreation); // signup, 
app.use('/api',loginRoutes); // login
app.use('/api/logout',LogOutRoute);
app.use('/api', spotifyRoutes);
app.use('/api', loginRoutes);
app.use('/api', loadFeedRoutes);
app.use('/api', followUserRoutes);
app.use('/api', createPostRoutes);
app.use('/api', profileRoutes);
app.use('/api', userSearchRoutes)
app.use('/api', likesRoutes);
app.use('/api', deezerRoutes);
app.use('/api', commentsRoutes);

app.use(defaultRoute);
app.use(invalidRoutes); // THIS HAS TO STAY LAST

// database connection
connectToDB();


// Enable CORS for all origins (can be customized)
app.use(cors());

app.get('/', (req, res) => {
  try{
      User.find({}).then(data => {
          res.json(data)
      }).catch(error => {
          res.status(408).json({ error })
      })
  }catch(error){
      res.json({error})
  }
})

app.post("/uploads", async (req, res) => {
  const body = req.body;
  try{
      const newImage = await User.create(body)
      newImage.save();
      res.status(201).json({ msg : "New image uploaded...!"})
  }catch(error){
      res.status(409).json({ message : error.message })
  }
})

  
// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  }); 
}

module.exports = app;
