const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const router = require("../routes/profile.js");
const User = require("../models/user.js");
const Post = require("../models/post.js");

jest.mock("../models/user.js");
jest.mock("../models/post.js"); 

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /profile", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if user_id is missing in request body", async () => {
        const response = await request(app).post("/profile").send({ page: 1 });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "missing user_id in request body" });
    });

    it("should return 400 if page is missing in request body", async () => {
        const response = await request(app).post("/profile").send({ user_id: "123" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "missing page in request body" });
    });

    it("should return 400 if page is less than 1", async () => {
        const response = await request(app).post("/profile").send({ user_id: "123", page: 0 });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "page parameter must be greater than or equal to 1" });
    });

    it("should return 404 if user is not found", async () => {
        User.findOne.mockResolvedValue(null); // mock user not found
        const response = await request(app).post("/profile").send({ user_id: "123", page: 1 });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ success: false, message: "user not found" });
    });

    it("should return 200 if no posts are available", async () => {
        User.findOne.mockImplementation((query) => {
            if (query.user_id === "123") {
                return {
                    select: jest.fn().mockResolvedValue({
                        username: "testuser",
                        bio: "bio",
                        profile_picture: "url",
                        followers_count: 10,
                        following_count: 5
                    })
                };
            }
            return null;
        });
    
        Post.find.mockImplementation(() => ({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([]) // no posts found
        }));
    
        const response = await request(app).post("/profile").send({ user_id: "123", page: 1 });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "user data has been retrieved successfully",
            data: {
                user: {
                    username: "testuser",
                    bio: "bio",
                    profile_picture: "url",
                    followers_count: 10,
                    following_count: 5
                },
                posts: []
            }
        });
    });
    

    it("should return 200 and user data with posts if posts are found", async () => {
        const mockUserData = { username: "testuser", bio: "bio", profile_picture: "url", followers_count: 10, following_count: 5 };
        const mockPosts = [{ title: "Post 1", content: "Content 1" }, { title: "Post 2", content: "Content 2" }];

        User.findOne.mockImplementation((query) => {
            if (query.user_id === "123") {
                return {
                    select: jest.fn().mockResolvedValue(mockUserData)
                };
            }
            return null;
        });

        Post.find.mockImplementation(() => ({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockPosts) // some posts found
        }));

        const response = await request(app).post("/profile").send({ user_id: "123", page: 1 });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "user data has been retrieved successfully",
            data: { user: mockUserData, posts: mockPosts }
        });
    });

    it("should return 500 if there is a server error", async () => {
        User.findOne.mockRejectedValue(new Error("Database error")); // mock server error
        const response = await request(app).post("/profile").send({ user_id: "123", page: 1 });
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ success: false, message: "internal server error", error: "Database error" });
    });
});

describe("PUT /api/profile/update", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if user_id is missing", async () => {
        const response = await request(app).put("/api/profile/update").send({ username: "newuser" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "user_id is required" });
    });

    it("should return 404 if user is not found", async () => {
        User.findOne.mockResolvedValue(null);

        const response = await request(app).put("/api/profile/update").send({ user_id: "123", username: "newuser" });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ success: false, message: "User not found." });
    });

    it("should return 400 if username is already taken", async () => {
        User.findOne.mockResolvedValueOnce({ user_id: "123", username: "testuser" }); // Current user
        User.findOne.mockResolvedValueOnce({ user_id: "456", username: "newuser" }); // Existing user with new username

        const response = await request(app).put("/api/profile/update").send({ user_id: "123", username: "newuser" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "Username already taken." });
    });

    it("should return 400 if email is already taken", async () => {
        User.findOne.mockResolvedValueOnce({ user_id: "123", email: "old@example.com" }); // Current user
        User.findOne.mockResolvedValueOnce({ user_id: "456", email: "new@example.com" }); // Existing user with new email

        const response = await request(app).put("/api/profile/update").send({ user_id: "123", email: "new@example.com" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "Email already in use." });
    });

    it("should return 400 if current password is incorrect", async () => {
        const hashedPassword = await bcrypt.hash("correctpassword", 10);
        User.findOne.mockResolvedValue({ user_id: "123", password: hashedPassword });

        const response = await request(app).put("/api/profile/update").send({
            user_id: "123",
            currentPassword: "wrongpassword",
            newPassword: "newpassword123"
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "Incorrect current password." });
    });

    it("should successfully update user profile", async () => {
        const hashedPassword = await bcrypt.hash("correctpassword", 10);
        User.findOne.mockResolvedValue({ user_id: "123", password: hashedPassword, save: jest.fn() });

        const response = await request(app).put("/api/profile/update").send({
            user_id: "123",
            username: "updateduser",
            bio: "updated bio",
            link: "https://updated.com"
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, message: "Profile updated successfully.", data: expect.any(Object) });
    });

    it("should update password with correct current password", async () => {
        const hashedPassword = await bcrypt.hash("correctpassword", 10);
        User.findOne.mockResolvedValue({ user_id: "123", password: hashedPassword, save: jest.fn() });

        const response = await request(app).put("/api/profile/update").send({
            user_id: "123",
            currentPassword: "correctpassword",
            newPassword: "newsecurepassword"
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, message: "Profile updated successfully.", data: expect.any(Object) });
    });

    it("should return 500 if there is a server error", async () => {
        User.findOne.mockRejectedValue(new Error("Database error"));
        const response = await request(app).put("/api/profile/update").send({ user_id: "123", username: "newuser" });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ success: false, message: "Internal server error.", error: "Database error" });
    });
});
