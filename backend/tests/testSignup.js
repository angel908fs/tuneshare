const axios = require('axios');

async function testSignup() {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/signup', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    console.log('Response:', response.data);  // Log the response data
  } catch (error) {
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('Error response data:', error.response.data);  // Log error data from response
      console.error('Status code:', error.response.status);       // Log status code
      console.error('Headers:', error.response.headers);          // Log headers
    } else if (error.request) {
      // Request was made, but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something else caused the error
      console.error('Error message:', error.message);
    }
    console.error('Full error:', error);  // Log the full error object for debugging
  }
}

testSignup();
