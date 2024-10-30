const request = require('supertest');
const express = require('express');
const router = require("../routes/spotify_routes.js"); // Ensure this path points to your router file
require('dotenv').config();

const app = express();
app.use('/', router);

describe('Spotify API Routes', () => {
  
  // Test /spotifylogin route
  it('should redirect to Spotify login URL on /spotifylogin', async () => {
    const response = await request(app).get('/spotifylogin');
    expect(response.status).toBe(302); // Check if response is a redirect
    expect(response.headers.location).toContain('https://accounts.spotify.com/authorize');
  });

  // Test /callback route without an authorization code
  it('should respond with an error if no authCode is provided to /callback', async () => {
    const response = await request(app).get('/callback');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Authorization code not received.');
  });
});
