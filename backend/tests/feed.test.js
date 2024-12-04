const express = require("express");
const request = require("supertest");
const router = require("../routes/feed.js");
const User = require("../models/user.js");
const Post = require("../models/post.js");

jest.mock("../models/user.js");
jest.mock("../models/post.js");

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /load-feed", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // clear mocks before each test
    });

    it("should return 400 if userID is missing", async () => {
        const res = await request(app)
            .post("/load-feed")
            .send({ page: 1 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Invalid request parameters." });
    });

    it("should return 400 if page is missing", async () => {
        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Invalid request parameters." });
    });

    it("should return 400 if page is less than 1", async () => {
        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 0 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Invalid request parameters." });
    });

    it("should return 404 if user is not found", async () => {
        User.findOne.mockResolvedValueOnce(null); // mock user not found

        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 1 });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: "User not found." });
    });

    it("should return 200 if no posts are available", async () => {
        const mockUser = { user_id: "1", following: ["2", "3"] };
        User.findOne.mockResolvedValueOnce(mockUser);
        Post.find.mockImplementation(() => ({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValueOnce([])  // no posts found
        }));

        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: true, message: "no posts available at the time" });
    });

    it("should return 200 with posts if posts are found", async () => {
        const mockUser = { user_id: "1", following: ["2", "3"], posts: [
            '{"post_id": "post1","content":"Post content 1"}',
            '{"post_id": "post2","content":"Post content 2"}',
        ],
     };
        const mockPosts = [{ _id: "post1", user_id: { username: "user2" }, content: "Post content",
        toObject: jest.fn().mockReturnValue({
            _id: "post1", user_id: "1", content: "Post content 1",
        }),
     }];

        User.findOne.mockResolvedValueOnce(mockUser);
        User.find.mockResolvedValueOnce(mockUser);
        Post.find.mockImplementation(() => ({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValueOnce(mockPosts)  // some posts found
        }));

        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: true, message: "Posts retrieved successfully.", data: mockPosts });
    });

    it("should return 500 if there is a server error", async () => {
        User.findOne.mockRejectedValueOnce(new Error("Database error"));

        const res = await request(app)
            .post("/load-feed")
            .send({ userid: "1", page: 1 });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ success: false, message: "Internal server error.", error: "Database error" });
    });
});
