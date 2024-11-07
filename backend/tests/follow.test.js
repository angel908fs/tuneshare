const express = require("express");
const request = require("supertest");
const router = require("../routes/follow_route.js"); // Adjust path if needed
jest.mock("../models/user.js"); // Mock the User model

const User = require("../models/user.js"); // Mock User model

const app = express(); // Create an express app
app.use(express.json()); // Enable JSON parsing
app.use("/", router); // Add the router to the app

// Mock user IDs
const u1_id = "1";
const u2_id = "2";
const u3_id = "3";
const u4_id = "4";

// Test cases
describe("POST /follow", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks between tests
    });

    it("should return 400 if userID is missing", async () => {
        const res = await request(app)
            .post("/follow")
            .send({ target_userID: u3_id });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Missing required parameter: userID" });
    });

    it("should return 400 if target_userID is missing", async () => {
        const res = await request(app)
            .post("/follow")
            .send({ userID: u1_id });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Missing required parameter: target_userID" });
    });

    it("should return 404 if the user does not exist", async () => {
        User.findOne.mockResolvedValueOnce(null); // Mock user not found

        const res = await request(app)
            .post("/follow")
            .send({ userID: u1_id, target_userID: u3_id });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: "User not found" });
    });

    it("should return 404 if the target user does not exist", async () => {
        User.findOne.mockResolvedValueOnce({ user_id: u2_id, followers: [], save: jest.fn() }) // Mock user found
            .mockResolvedValueOnce(null); // Mock target user not found

        const res = await request(app)
            .post("/follow")
            .send({ userID: u1_id, target_userID: u3_id });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: "Target user not found" });
    });

    it("should return 409 if the user is already following the target user", async () => {
        let user1 = { user_id: u1_id, following: [u3_id], save: jest.fn() };
        let user2 = { user_id: u3_id, followers: [u1_id], save: jest.fn() };

        User.findOne
            .mockResolvedValueOnce(user1) // Mock user1 found
            .mockResolvedValueOnce(user2); // Mock user2 found

        const res = await request(app)
            .post("/follow")
            .send({ userID: user1.user_id, target_userID: user2.user_id });

        expect(res.statusCode).toBe(409);
        expect(res.body).toEqual({
            success: false,
            message: "User is already following target user",
        });
    });

    it("should return 200 if the user successfully follows the target user", async () => {
        let user1 = { user_id: u1_id, following: [], save: jest.fn() };
        let user2 = { user_id: u3_id, followers: [], save: jest.fn() };

        User.findOne
            .mockResolvedValueOnce(user1) // Mock user1 found
            .mockResolvedValueOnce(user2); // Mock user2 found

        const res = await request(app)
            .post("/follow")
            .send({ userID: user1.user_id, target_userID: user2.user_id });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: "User followed successfully",
        });

        // Ensure both users' lists were updated correctly
        expect(user1.following).toContain(u3_id);
        expect(user2.followers).toContain(u1_id);

        // Ensure save() was called for both users
        expect(user1.save).toHaveBeenCalled();
        expect(user2.save).toHaveBeenCalled();
    });

    it("should return 500 if there is a server error", async () => {
        // Simulate a database error
        User.findOne.mockRejectedValueOnce(new Error("Database error"));
        const res = await request(app)
            .post("/follow")
            .send({ userID: u3_id, target_userID: u4_id });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ success: false, message: "Server error", error: "Database error" });
    });
});
