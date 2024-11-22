const express = require('express');
require('dotenv').config();
const axios = require("axios"); 
const querystring = require('querystring'); 
const SpotifyWebApi = require('spotify-web-api-js');

let router = express.Router(); //route to express app

const spotifyApi = new SpotifyWebApi({ // initialize Spotify with credentials
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  redirectUri: process.env.REDIRECTURI
});


// paths are taken only when using backend server (localhost:8080)
// route to authenticate user via Spotify
router.get('/spotifylogin', function(req, res) { 
  // console.log("Redirecting to Spotify...");
  const spotifyAuthURL = 'https://accounts.spotify.com/authorize?' +  
    querystring.stringify({ //get request that authenticates user by logging into spotify account
      response_type: 'code', 
      client_id: process.env.CLIENTID, //uses client id and redirect uri from project info defined in spotify dev dashboard
      redirect_uri: process.env.REDIRECTURI
    });
    
  return res.redirect(spotifyAuthURL); // after taking path, redirected to spotify login
});

router.get('/refreshtoken', async function(req,res){
  const refresh_token = req.query.refresh_token;

  if (!refresh_token) {
    return res.status(400).send({ success: false, message: 'Refresh token is required.' });
  }
  
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
    return res.status(200).send({success: true, message: "Token up to date"}); //since there is no new refresh token in the response data there is no need to update env var
  } 
}catch(error){
    return res.status(500).send({success: false, message: 'Failed to refresh token', error: error.message });
  }
});

// Callback route to handle authorization code from Spotify
router.get("/callback", async function(req, res){
  const authCode = req.query.code;

  if (!authCode) {
    return res.status(400).send({success: false, message: "Authorization code not received."});// if no response after redirect to spotify, then give error msg
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

    // set environment variables for testing (avoid in production)
    //access & Refresh token are not stored in env 
    process.env.ACCESSTOKEN = access_token;
    process.env.REFRESHTOKEN = refresh_token;

    // respond to the user
    return res.status(201).send({success: true, message:"Tokens have been received and stored."});
    
  } catch (error) {
    return res.status(500).send({success: false, message: "An error occurred while exchanging tokens.", error: error.message});
  }
});

router.get('/search', async (req, res) => {
  const query = req.query.q;
  const accessToken = process.env.ACCESSTOKEN;

  if (!query) {
    return res.status(400).send({success: false, message: 'Query parameter "q" is required.'});
  }
  
  if (!accessToken) {
    return res.status(401).send({success: false, message: 'Access token not available. Please log in.'});
  }

  try {
    // use Axios to search for tracks
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: 'track',
      },
    });

    // format the track data
    const tracks = response.data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(artist => artist.name), // map artist objects to their names
      external_urls: track.external_urls,
      preview_url: track.preview_url,
    }));
    
    return res.status(200).send({success: true, message: "found some tracks", data: tracks});
  } catch (error) {
    // console.error('Error searching tracks:', error);
    
    // handle token expiration
    if (error.response && error.response.status === 401) {
      return res.status(401).send({success: false, message: 'Access token expired. Please log in again.'});
    } else {
      return res.status(500).send({success: false, message: 'Error searching tracks', error: error.message});

    }
  }
});

// playback Controls
router.post('/play', async (req, res) => {
  const accessToken = process.env.ACCESSTOKEN;

  if (!accessToken) {
    return res.status(401).send({success: false, message:'Access token not available. Please log in.'});
  }

  try {
    await axios.put('https://api.spotify.com/v1/me/player/play', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    res.send('Playback started');
  } catch (error) {
    return res.status(500).send({success: false, message: 'Error starting playback', error: error.message});
  }
});

router.post('/pause', async (req, res) => {
  const accessToken = process.env.ACCESSTOKEN;

  if (!accessToken) {
    return res.status(401).send({success: false, message: 'Access token not available. Please log in.'});
  }

  try {
    await axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    res.send('Playback paused');
  } catch (error) {
      return res.status(500).send({success: false, message: 'Error pausing playback', error: error.message});
  }
});

router.post('/next', async (req, res) => {
  const accessToken = process.env.ACCESSTOKEN;

  if (!accessToken) {
    return res.status(401).send({success: false, message: 'Access token not available. Please log in.', error: error.message});
  }

  try {
    await axios.post('https://api.spotify.com/v1/me/player/next', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    res.send('Skipped to next track');
  } catch (error) {
    return res.status(500).send({success: false, message: 'Error skipping to next track', error: error.message});
  }
});

router.post('/previous', async (req, res) => {
  const accessToken = process.env.ACCESSTOKEN;

  if (!accessToken) {
    return res.status(401).send({success: false, message: 'Access token not available. Please log in.'});
  }

  try {
    await axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    res.send('Skipped to previous track');
  } catch (error) {
    return res.status(500).send({success: false, message: 'Error skipping to previous track', error: error.message});
  }
});

//function that utilizes all of the control 

module.exports = router;