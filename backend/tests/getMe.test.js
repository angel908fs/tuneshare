

const request = require('supertest');
const express = require('express');
const { authToken } = require('../utils/AuthenticateToken'); // Mock this
const User = require('../models/user'); // Mock this
const getMeRouter = require('../routes/getMe_route'); // Adjust path if needed

jest.mock('../utils/AuthenticateToken'); // Mocking the authToken middleware
jest.mock('../models/user'); // Mocking the User model

// Set up the Express app
const app = express();
app.use(express.json());
app.use('/me', getMeRouter);

describe('GET /me', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should return the authenticated user data when token is valid', async () => {
        // Mock the authToken middleware to set a mock user on req.user
        authToken.mockImplementation((req, res, next) => {
            req.user = { user_id: '12345', email: 'test@example.com' };
            next();
        });

        // Mock the User.findById method to return a user object
        User.findById.mockResolvedValue({ 
            user_id: '12345', 
            email: 'test@example.com', 
            username: 'Test User' 
        });

        // Send the request using Supertest
        const response = await request(app).get('/me');

        // Assertions
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User Authenticated!');
        expect(response.body.user).toMatchObject({
            user_id: '12345',
            email: 'test@example.com'
        });
    });

    it('should return 404 if user is not found', async () => {
        // Mock the authToken middleware to set a mock user on req.user
        authToken.mockImplementation((req, res, next) => {
            req.user = { user_id: '12345', email: 'test@example.com' };
            next();
        });

        // Mock the User.findById method to return null (user not found)
        User.findById.mockResolvedValue(null);

        // Send the request using Supertest
        const response = await request(app).get('/me');

        // Assertions
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('User not found');
    });

    it('should return 500 if an error occurs', async () => {
        // Mock the authToken middleware to set a mock user on req.user
        authToken.mockImplementation((req, res, next) => {
            req.user = { user_id: '12345', email: 'test@example.com' };
            next();
        });

        // Mock the User.findById method to throw an error
        User.findById.mockImplementation(() => {
            throw new Error('Database error');
        });

        // Send the request using Supertest
        const response = await request(app).get('/me');

        // Assertions
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('could not authenticate');
    });
});
