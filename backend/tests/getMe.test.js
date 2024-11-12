const request = require("supertest");
const express = require("express");
const User = require('../models/user');
const { authToken } = require('../utils/AuthenticateToken');
const authRoutes = require('./routes/getMe_route.js');

jest.mock('../models/user');
jest.mock('../utils/AuthenticateToken');

const app = express();
app.use(express.json());
app.use('/api', authRoutes); // Assuming your route is '/api/user'

describe("GET /api/user/me", () => {
    

    it("should return 200 and user data when authenticated", async () => {
        // Mock authToken middleware to simulate an authenticated user
        authToken.mockImplementation((req, res, next) => {
            req.user = { _id: "mockUserId" }; // Simulated authenticated user ID
            next();
        });

        // Mock User.findById to return a user object
        User.findById.mockResolvedValue({ _id: "mockUserId", email: "user@example.com", name: "Test User" });

        const res = await request(app).get("/api/user/me");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: "User authenticated successfully",
            user: { _id: "mockUserId", email: "user@example.com", name: "Test User" }
        });
    });

    it("should return 404 if the user is not found", async () => {
        // Mock authToken to simulate a logged-in user
        authToken.mockImplementation((req, res, next) => {
            req.user = { _id: "mockUserId" };
            next();
        });

        // Mock User.findById to return null, simulating user not found
        User.findById.mockResolvedValue(null);

        const res = await request(app).get("/api/user/me");

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            success: false,
            message: "User not found"
        });
    });

    it("should return 500 if there is a server error", async () => {
        // Mock authToken as in the previous tests
        authToken.mockImplementation((req, res, next) => {
            req.user = { _id: "mockUserId" };
            next();
        });

        // Mock User.findById to throw an error, simulating a server/database issue
        User.findById.mockRejectedValue(new Error("Database error"));

        const res = await request(app).get("/api/user/me");

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: "Could not authenticate"
        });
    });
});
