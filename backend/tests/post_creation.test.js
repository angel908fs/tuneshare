const request = require("supertest");
const express = require("express");
const router = require("../routes/post_creation.js");
const { createPost } = require("../utils/post.js");

jest.mock("../utils/post.js");

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /create-post", () => {
    it("should return 400 if the user_id is missing", async () => {
        const res = await request(app).post("/create-post").send({
            song_link: "https://spotify.com/song",
            content: "Missing user ID"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Please enter a user ID for the post." });
    });

    it("should return 400 if the song_link is missing", async () => {
        const res = await request(app).post("/create-post").send({
            user_id: "UserID123",
            content: "Missing song link"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Please add a song link for the post." });
    });

    it("should return 400 if the content is missing", async () => {
        const res = await request(app).post("/create-post").send({
            user_id: "UserID123",
            song_link: "https://spotify.com/song"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Please provide content for the post." });
    });

    it("should create a post successfully with all parameters provided", async () => {
        const mockPost = {
            user_id: "UserID123",
            song_link: "https://spotify.com/song",
            content: "This is a test post."
        };

        createPost.mockResolvedValue({ success: true, post: mockPost });

        const res = await request(app).post("/create-post").send(mockPost);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            success: true,
            message: "Post has been created successfully",
            data: mockPost
        });
    });

    it("should handle errors during post creation", async () => {
        createPost.mockRejectedValue(new Error("Server error"));

        const res = await request(app).post("/create-post").send({
            user_id: "ErrorUserId",
            song_link: "https://spotify.com/song",
            content: "A post that will fail."
        });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ success: false, message: "Internal server error." });
    });
});
