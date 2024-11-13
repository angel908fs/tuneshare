const jwt = require('jsonwebtoken');
const { authToken } = require('../utils/AuthenticateToken');
const User = require('../models/user');
const express = require('express');
const request = require('supertest');
const cookieParser = require('cookie-parser');
const { set } = require('../server');

jest.mock('../models/user');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());

// Sample route to test middleware
app.get('/protected', authToken, (req, res) => {
    res.status(200).send({ success: true, user: req.user });
});
describe('authToken Middleware', () => {
    afterEach(()=> {
        jest.clearAllMocks();
    });
    it('should return 401 if no token is provided', async () => {
        const res = await request(app).get('/protected'); // No token sent

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ success: false, message: 'Unauthorized: No Token Provided' });
    });

    it('should return 401 if token is invalid', async () => {
        jwt.verify.mockImplementation(() => { throw new Error("Invalid token") }); // Simulate invalid token

        const res = await request(app)
            .get('/protected')
            .set('Cookie', 'jwt=invalid-token'); // Simulate invalid token in cookie

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ success: false, message: 'Unauthorized: No Token Provided' });
    });

    it('should return 404 if user is not found', async () => {
        jwt.verify.mockReturnValue({ user_id: 'nonExistentUserId'}); // Simulate valid token with user_id
        User.findById.mockResolvedValue(null); // Simulate no user found in the database

        const res = await request(app)
            .get('/Protected')
            .set('Cookie', 'jwt=valid-token');

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: 'User not found' });
    });

    it('should return 500 if there is a server error', async () => {
        // Mock jwt.verify to return a decoded token
        jwt.verify.mockReturnValue({ user_id: 'validUserId' });
        
        // Mock User.findById to throw an error (simulating a database error)
        User.findById.mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .get('/protected')
            .set('Cookie', 'jwt=valid-token'); // Set valid token

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ success: false, message: 'Internal Server Error, In AuthenticateToken' });
    });

    it('should return 200 and user data if authenticated', async () => {
        // Mock jwt.verify to return a decoded token
        jwt.verify.mockReturnValue({ user_id: 'validUserId' });
        
        // Mock User.findById to return a user object
        User.findById.mockResolvedValue({ _id: 'validUserId', email: 'user@example.com' });

        const res = await request(app)
            .get('/protected')
            .set('Cookie', 'jwt=valid-token'); // Set valid token

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            success: true,
            user: { _id: 'validUserId', email: 'user@example.com' }
        });
    });
});
