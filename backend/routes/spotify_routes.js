const express = require('express');
require('dotenv').config();
const axios = require("axios"); // Use axios instead of request
const querystring = require('querystring'); // Import querystring for redirect URL
const SpotifyWebApi = require('spotify-web-api-js');

let router = express.Router(); //route to express app

const spotifyApi = new SpotifyWebApi({ // initialize Spotify with credentials
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  redirectUri: process.env.REDIRECTURI
});


// paths are taken only when using backend server (localhost:8080)
// Route to authenticate user via Spotify
router.get('/spotifylogin', function(req, res) { 
  console.log("Redirecting to Spotify...");
  const spotifyAuthURL = 'https://accounts.spotify.com/authorize?' +  
    querystring.stringify({ //get request that authenticates user by logging into spotify account
      response_type: 'code', 
      client_id: process.env.CLIENTID, //uses client id and redirect uri from project info defined in spotify dev dashboard
      redirect_uri: process.env.REDIRECTURI
    });
    
  res.redirect(spotifyAuthURL); // after taking path, redirected to spotify login
});

router.get('/refreshtoken', async function(req,res){
  const refresh_token = req.query.refresh_token;
  
  try{
  const response = await axios({
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(process.env.CLIENTID + ':' + process.env.CLIENTSECRET).toString('base64') // present the client id and secret in the post request header
    },
    data: new URLSearchParams({ //generate a query string from the key-value pairs 
      grant_type: 'refresh_token',
      refresh_token: process.env.REFRESHTOKEN
    }).toString()
  });

  if(response.status === 200){
    res.send("Refresh token had been updated"); //since there is no new refresh token in the response data there is no need to update env var
  } 
}catch(error){
    console.error('Error when refreshing token: ', error); //if theres an error give error in server response
    res.status(500).send({error: 'Failed to refresh token' });
  }
});

// Callback route to handle authorization code from Spotify
router.get("/callback", async function(req, res){
  const authCode = req.query.code;

  if (!authCode) {
    return res.send("Authorization code not received.");// if no response after redirect to spotify, then give error msg
  }

  // Exchange the authorization code for an access token
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: authCode, // provide authorization from /spotify route
        redirect_uri: process.env.REDIRECTURI,
        client_id: process.env.CLIENTID, 
        client_secret:  process.env.CLIENTSECRET //client secret provided in project dashboard
      })
    });

    const { access_token, refresh_token } = response.data;

    // Set environment variables for testing (avoid in production)
    //Access & Refresh token are not stored in env 
    process.env.ACCESSTOKEN = access_token;
    process.env.REFRESHTOKEN = refresh_token;

    // Respond to the user
    res.send("Tokens have been received and stored.");
    
  } catch (error) {
    console.error("Error exchanging code for tokens: ", error);
    res.send("An error occurred while exchanging tokens.");
  }
});

router.get('/search', async (req, res) => {
  const query = req.query.q;
  const accessToken = process.env.ACCESSTOKEN;

  if (!query) {
    return res.status(400).send('Query parameter "q" is required.');
  }
  
  if (!accessToken) {
    return res.status(401).send('Access token not available. Please log in.');
  }

  try {
    // Use Axios to search for tracks
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: 'track',
      },
    });

    // Format the track data
    const tracks = response.data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.name,
      external_urls: track.external_urls,
      preview_url: track.preview_url,
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Error searching tracks:', error);
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      res.status(401).send('Access token expired. Please log in again.');
    } else {
      res.status(500).send('Error searching tracks');
    }
  }
});

// Playback Controls
router.post('/play', async (req, res) => {
  const accessToken = process.env.ACCESSTOKEN;

  if (!accessToken) {
    return res.status(401).send('Access token not available. Please log in.');
  }

  try {
    await axios.put('https://api.spotify.com/v1/me/player/play', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    res.send('Playback started');
  } catch (error) {
    console.error('Error starting playback:', error);
    res.status(500).send('Error starting playback');
  }
});

router.post('/pause', async (req, res) => {
  const accessToken = process.env.ACCESSTOKEN;

  if (!accessToken) {
    return res.status(401).send('Access token not available. Please log in.');
  }

  try {
    await axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    res.send('Playback paused');
  } catch (error) {
    console.error('Error pausing playback:', error);
    res.status(500).send('Error pausing playback');
  }
});

router.post('/next', async (req, res) => {
  const accessToken = process.env.ACCESSTOKEN;

  if (!accessToken) {
    return res.status(401).send('Access token not available. Please log in.');
  }

  try {
    await axios.post('https://api.spotify.com/v1/me/player/next', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    res.send('Skipped to next track');
  } catch (error) {
    console.error('Error skipping to next track:', error);
    res.status(500).send('Error skipping to next track');
  }
});

router.post('/previous', async (req, res) => {
  const accessToken = process.env.ACCESSTOKEN;

  if (!accessToken) {
    return res.status(401).send('Access token not available. Please log in.');
  }

  try {
    await axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    res.send('Skipped to previous track');
  } catch (error) {
    console.error('Error skipping to previous track:', error);
    res.status(500).send('Error skipping to previous track');
  }
});

//function that utilizes all of the control 

module.exports = router;