const express = require('express');
require('dotenv').config();
const axios = require("axios"); // Use axios instead of request
const querystring = require('querystring'); // Import querystring for redirect URL

let router = express.Router(); //route to express app

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

module.exports = router;
