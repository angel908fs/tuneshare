const request = require('supertest');
const express = require('express');
const router = require("../routes/spotify_routes.js");
const axios = require('axios');
jest.mock('axios');
require('dotenv').config();

const app = express();
app.use('/', router);

describe('Spotify API Routes', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test /spotifylogin route
  it('should redirect to Spotify login URL on /spotifylogin', async () => {
    const response = await request(app).get('/spotifylogin');
    expect(response.status).toBe(302); // Check if response is a redirect
    expect(response.headers.location).toContain('https://accounts.spotify.com/authorize');
  });

  // test /callback route without an authorization code
  it('should respond with an error if no authCode is provided to /callback', async () => {
    const response = await request(app).get('/callback');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: "Authorization code not received." });
  });

  // test /callback route with an authorization code
  it('should exchange authorization code for tokens on /callback', async () => {
    const mockTokens = { access_token: 'mock_access_token', refresh_token: 'mock_refresh_token' };
    axios.mockResolvedValueOnce({ data: mockTokens });

    const response = await request(app).get('/callback?code=mock_auth_code');
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Tokens have been received and stored."
    });
  });

  // test /callback route with an error during token exchange
  it('should handle errors during token exchange on /callback', async () => {
    // Mock Axios to reject with an error
    axios.mockRejectedValueOnce(new Error("Token exchange error"));
  
    // Make the request to the /callback route
    const response = await request(app).get('/callback?code=mock_auth_code');
  
    // Assert status and response
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "An error occurred while exchanging tokens.",
      error: "Token exchange error"
    });
  });
  

  // test /refreshtoken route without a refresh token
  it('should return 400 if no refresh token is provided on /refreshtoken', async () => {
    const response = await request(app).get('/refreshtoken');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Refresh token is required.' });
  });

  // test /refreshtoken route with a valid refresh token
  it('should refresh token on /refreshtoken', async () => {
    axios.mockResolvedValueOnce({ status: 200, data: { access_token: 'new_access_token' } });

    const response = await request(app).get('/refreshtoken?refresh_token=mock_refresh_token');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: "Token up to date" });
  });

  // test /refreshtoken route with an error during token refresh
  it('should handle errors during token refresh on /refreshtoken', async () => {
    axios.mockRejectedValueOnce(new Error("Refresh token error"));

    const response = await request(app).get('/refreshtoken?refresh_token=mock_refresh_token');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ success: false, message: 'Failed to refresh token', error: 'Refresh token error' });
  });

  // test /search route without a query parameter
  it('should return 400 if no query parameter is provided to /search', async () => {
    const response = await request(app).get('/search');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Query parameter "q" is required.' });
  });

  // test /search route without an access token
  it('should return 401 if access token is not available on /search', async () => {
    delete process.env.ACCESSTOKEN; // Ensure access token is not set
    const response = await request(app).get('/search?q=test');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ success: false, message: 'Access token not available. Please log in.' });
  });

  // test /search route with a valid query and access token
  it('should return search results on /search', async () => {
    process.env.ACCESSTOKEN = 'mock_access_token';
  
    // Mock the Spotify API response
    axios.get.mockResolvedValueOnce({
      data: {
        tracks: {
          items: [
            {
              id: '1',
              name: 'Track 1',
              artists: [{ name: 'Artist 1' }],
              external_urls: { spotify: 'https://spotify.com/track1' },
              preview_url: 'https://preview.com/track1.mp3',
            },
            {
              id: '2',
              name: 'Track 2',
              artists: [{ name: 'Artist 2' }],
              external_urls: { spotify: 'https://spotify.com/track2' },
              preview_url: 'https://preview.com/track2.mp3',
            },
          ],
        },
      },
    });
  
    // Send the request to the /search route
    const response = await request(app).get('/search?q=test');
  
    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "found some tracks",
      data: [
        {
          id: '1',
          name: 'Track 1',
          artists: ['Artist 1'], // Array of artist names
          external_urls: { spotify: 'https://spotify.com/track1' },
          preview_url: 'https://preview.com/track1.mp3',
        },
        {
          id: '2',
          name: 'Track 2',
          artists: ['Artist 2'], // Array of artist names
          external_urls: { spotify: 'https://spotify.com/track2' },
          preview_url: 'https://preview.com/track2.mp3',
        },
      ],
    });
  });
  

  // test /search route with an expired access token
  it('should handle expired access token on /search', async () => {
    process.env.ACCESSTOKEN = 'expired_token';
    axios.get.mockRejectedValueOnce({ response: { status: 401 } });

    const response = await request(app).get('/search?q=test');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ success: false, message: 'Access token expired. Please log in again.' });
  });

  // test /search route with a server error
  it('should handle server errors on /search', async () => {
    process.env.ACCESSTOKEN = 'mock_access_token';
    axios.get.mockRejectedValueOnce(new Error("Search error"));

    const response = await request(app).get('/search?q=test');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ success: false, message: 'Error searching tracks', error: 'Search error' });
  });
});
