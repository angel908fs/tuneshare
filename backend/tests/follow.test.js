const express = require("express");
const request = require("supertest");
const router = require("../routes/follow_route.js"); // Adjust path if needed
const User = require("../models/user.js"); // Mock User model

jest.mock("../models/user.js"); // Mock the User model

const app = express(); // Create an express app
app.use(express.json()); // Enable JSON parsing
app.use("/", router); // Add the router to the app

// Mock user IDs
const u1_id = "1";
const u2_id = "2";
const u3_id = "3";
const u4_id = "4";

// Helper function to simulate user1 following user2
async function makeUser1_FollowUser2() {
    const user1 = { user_id: u1_id, following: [u2_id], save: jest.fn() }; // Already following user2
    const user2 = { user_id: u2_id, followers: [u1_id], save: jest.fn() };

    User.findOne.mockResolvedValueOnce(user1).mockResolvedValueOnce(user2); // Mock users

    return { user1, user2 };
}


// Test cases
describe("POST /follow", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks between tests
    });

    it("should return 404 if the user does not exist", async () => {
        User.findOne.mockResolvedValueOnce(null); // Mock user not found

        const res = await request(app)
            .post("/follow")
            .send({ user_id: u1_id, target_user_id: u3_id });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: "User or friend not found" });
    });

    it("should return 404 if the target user does not exist", async () => {
        User.findOne.mockResolvedValueOnce({ user_id: u2_id, followers: [], save: jest.fn() }) // Mock user found
            .mockResolvedValueOnce(null); // Mock target user not found

        const res = await request(app)
            .post("/follow")
            .send({ user_id: u1_id, target_user_id: u3_id });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: "User or friend not found" });
    });

    it("should return 409 if the user is already following the target user", async () => {
        const { user1, user2 } = await makeUser1_FollowUser2();

        User.findOne
            .mockResolvedValueOnce(user1) // Mock user1 found
            .mockResolvedValueOnce(user2); // Mock user2 found

        const res = await request(app)
            .post("/follow")
            .send({ user_id: user1.user_id, target_user_id: user2.user_id });

        expect(res.statusCode).toBe(409);
        expect(res.body).toEqual({
            error: "User is already friends with this user",
        });
    });

    it("should return 409 if the target user already has the user as a follower", async () => {
        const { user1, user2 } = await makeUser1_FollowUser2();

        // Reverse the scenario: User2 already has User1 as a follower
        user2.following.push(user1.user_id);

        User.findOne
            .mockResolvedValueOnce(user1) // Mock user1 found
            .mockResolvedValueOnce(user2); // Mock user2 found

        const res = await request(app)
            .post("/follow")
            .send({ user_id: user1.user_id, target_user_id: user2.user_id });

        expect(res.statusCode).toBe(409);
        expect(res.body).toEqual({
            error: "Target user already has user as follower",
        });
    });

    it("should return 200 if the user successfully follows the target user", async () => {
        const user1 = { user_id: u1_id, following: [u2_id], save: jest.fn() };
        const user2 = { user_id: u2_id, followers: [u1_id], save: jest.fn() };

        User.findOne
            .mockResolvedValueOnce(user1) // Mock user1 found
            .mockResolvedValueOnce(user2); // Mock user2 found

        const res = await request(app)
            .post("/follow")
            .send({ user_id: user1.user_id, target_user_id: user2.user_id });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            success: "User followed successfully",
        });

        // Ensure both users' lists were updated correctly
        expect(user1.following).toContain(u2_id);
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
            .send({ user_id: u1_id, target_user_id: u2_id });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Server error" });
    });
});
