// logout.test.js
const request = require('supertest');
const express = require('express');
const logoutRoute = require('../routes/logout'); // Adjust the path as needed

const app = express();
app.use(express.json()); // To parse JSON request bodies
app.use('/api/logout', logoutRoute); // Mounting the route

describe('POST /api/logout', () => {
  it('should clear the jwt cookie and return a success message', async () => {
    const response = await request(app)
      .post('/api/logout')
      .set('Cookie', 'jwt=validtoken;') // Set a dummy jwt cookie to simulate logout
      .expect(200);

    // Assertions
    expect(response.body).toEqual({ success: 'Logged Out Sucessfully' });
    expect(response.headers['set-cookie'][0]).toMatch(/jwt=;/); // Ensure the cookie is cleared
    expect(response.headers['set-cookie'][0]).toMatch(/Max-Age=0/); // Ensure Max-Age is set to 0 to clear the cookie
  });

  it('should handle server errors', async () => {
    // Simulate a server error by temporarily replacing res.cookie
    const originalCookie = express.response.cookie;
    express.response.cookie = () => { throw new Error('Test error'); };

    const response = await request(app)
      .post('/api/logout')
      .expect(500);

    expect(response.body).toEqual({ error: 'Internal Server Error' });

    // Restore the original res.cookie function
    express.response.cookie = originalCookie;
  });
});
