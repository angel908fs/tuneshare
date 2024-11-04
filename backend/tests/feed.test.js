const express = require("express");
const request = require("supertest");
const router = require("../routes/feed.js");
const User = require("../models/user.js");
const Post = require("../models/post.js");

jest.mock("../models/user.js"); // Mock User model
jest.mock("../models/post.js"); // Mock Post model

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /load-feed", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it("should return 400 if userID is missing", async () => {
        const res = await request(app)
            .post("/load-feed")
            .send({ page: 1 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "missing user id in request body" });
    });

    it("should return 400 if page is missing", async () => {
        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "missing page in request body" });
    });

    it("should return 400 if page is less than 1", async () => {
        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 0 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "page parameter must be greater than or equal to 1" });
    });

    it("should return 404 if user is not found", async () => {
        User.findOne.mockResolvedValueOnce(null); // Mock user not found

        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 1 });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: "user not found" });
    });

    it("should return 404 if no posts are available", async () => {
        const mockUser = { user_id: "1", following: ["2", "3"] };
        User.findOne.mockResolvedValueOnce(mockUser);
        Post.find.mockImplementation(() => ({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValueOnce([])  // No posts found
        }));

        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 1 });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: true, message: "no posts available at the time" });
    });

    it("should return 200 with posts if posts are found", async () => {
        const mockUser = { user_id: "1", following: ["2", "3"] };
        const mockPosts = [{ _id: "post1", user_id: { username: "user2" }, content: "Post content" }];

        User.findOne.mockResolvedValueOnce(mockUser);
        Post.find.mockImplementation(() => ({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValueOnce(mockPosts)  // Posts found
        }));

        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: true, data: mockPosts });
    });

    it("should return 500 if there is a server error", async () => {
        User.findOne.mockRejectedValueOnce(new Error("Database error"));

        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 1 });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ success: false, message: "internal server error", error: "Database error" });
    });
});
