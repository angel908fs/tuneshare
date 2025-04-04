const express = require("express");
const request = require("supertest");
const router = require("../routes/follow_route.js"); 
jest.mock("../models/user.js"); 

const User = require("../models/user.js");

const app = express(); 
app.use(express.json()); 
app.use("/", router); 

// dummy user IDs
const u1_id = "1";
const u2_id = "2";
const u3_id = "3";
const u4_id = "4";

describe("POST /follow", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // reset mocks between tests
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
        User.findOne.mockResolvedValueOnce({ user_id: u2_id, followers: [], following_count: 0, save: jest.fn() }) // mock user found
            .mockResolvedValueOnce(null); // mock target user not found

        const res = await request(app)
            .post("/follow")
            .send({ userID: u1_id, target_userID: u3_id });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: "Target user not found" });
    });

    it("should return 409 if the user is already following the target user", async () => {
        let user1 = { user_id: u1_id, following: [u3_id], following_count: 1, save: jest.fn() };
        let user2 = { user_id: u3_id, followers: [u1_id], followers_count: 1, save: jest.fn() };

        User.findOne
            .mockResolvedValueOnce(user1) // mock user1 found
            .mockResolvedValueOnce(user2); // mock user2 found

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
        let user1 = { user_id: u1_id, following: [], following_count: 0, save: jest.fn() };
        let user2 = { user_id: u3_id, followers: [], followers_count: 0, save: jest.fn() };

        User.findOne
            .mockResolvedValueOnce(user1) // mock user1 found
            .mockResolvedValueOnce(user2); // mock user2 found

        const res = await request(app)
            .post("/follow")
            .send({ userID: user1.user_id, target_userID: user2.user_id });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: "User followed successfully",
        });

        // ensure both users' lists were updated correctly
        expect(user1.following).toContain(u3_id);
        expect(user2.followers).toContain(u1_id);

        // ensure counts were incremented
        expect(user1.following_count).toBe(1);
        expect(user2.followers_count).toBe(1);

        // ensure save() was called for both users
        expect(user1.save).toHaveBeenCalled();
        expect(user2.save).toHaveBeenCalled();
    });

    it("should return 500 if there is a server error", async () => {
        // simulate a database error
        User.findOne.mockRejectedValueOnce(new Error("Database error"));
        const res = await request(app)
            .post("/follow")
            .send({ userID: u3_id, target_userID: u4_id });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ success: false, message: "Server error", error: "Database error" });
    });
});

describe("POST /unfollow", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if userID is missing", async() => {
        const res = await request(app)
            .post("/unfollow")
            .send({ target_userID: u2_id});
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({success: false, message: "Missing required parameter: userID"});
    });

    it("should return 400 if target_userID is missing", async () => {
        const res = await request(app)
            .post("/unfollow")
            .send({ userID: u1_id });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({success: false, message: "Missing required parameter: target_userID"});
    });
    
    it("should return 4040 if use ris not found", async() => {
        User.findOne.mockResolvedValueOnce(null);
        const res = await request(app)
            .post("/unfollow")
            .send({ userID: u1_id, target_userID: u2_id });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: "User not found"});
    });

    it("should return 404 if target user is not found", async () => {
        const mockUser = {
            user_id: u1_id,
            following: [u2_id],
            following_count: 1,
            save: jest.fn(),
        };
        
        User.findOne
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce(null);

        const res = await request(app)
            .post("/unfollow")
            .send({ userID: u1_id, target_userID: u2_id});
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({success: false, message: "Target user not found" });
    });

    
  it("should return 409 if user is not following target user", async () => {
    const mockUser = {
      user_id: u1_id,
      following: [],
      following_count: 0,
      save: jest.fn(),
    };

    const mockTarget = {
      user_id: u2_id,
      followers: [],
      followers_count: 0,
      save: jest.fn(),
    };

    User.findOne
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTarget);

    const res = await request(app)
      .post("/unfollow")
      .send({ userID: u1_id, target_userID: u2_id });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ success: false, message: "User is not following target user" });
  });

  it("should successfully unfollow and update counts", async () => {
    const mockUser = {
      user_id: u1_id,
      following: [u2_id],
      following_count: 1,
      save: jest.fn(),
    };

    const mockTarget = {
      user_id: u2_id,
      followers: [u1_id],
      followers_count: 1,
      save: jest.fn(),
    };

    User.findOne
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockTarget);

    const res = await request(app)
      .post("/unfollow")
      .send({ userID: u1_id, target_userID: u2_id });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "User unfollowed",
      isFollowing: false,
    });

    expect(mockUser.following).not.toContain(u2_id);
    expect(mockUser.following_count).toBe(0);
    expect(mockUser.save).toHaveBeenCalled();

    expect(mockTarget.followers).not.toContain(u1_id);
    expect(mockTarget.followers_count).toBe(0);
    expect(mockTarget.save).toHaveBeenCalled();
  });

  it("should return 500 if there is a server error", async () => {
    User.findOne.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .post("/unfollow")
      .send({ userID: u1_id, target_userID: u2_id });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: "Server error",
      error: "DB error",
    });
  });
});