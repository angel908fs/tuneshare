const request = require("supertest");
const express = require("express");
const router = require("../routes/post_creation.js");
const { createPost } = require("../utils/post.js");

jest.mock("../utils/post.js");

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /create-post", () =>
{
    it("should return 400 if missing required fields", async () =>
    {
        const noUserId = await request(app).post("/create-post").send(
        {
            song_link: "localhost",
            content: "No user ID"
        });

        const noSongLink = await request(app).post("/create-post").send(
        {
            user_id: "UserID",
            content: "No song link"
        });

        const noContent = await request(app).post("/create-post").send(
        {
            user_id: "NoContent",
            song_link: "localhost"
        });

        expect(noUserId.statusCode).toBe(400);
        expect(noSongLink.statusCode).toBe(400);
        expect(noContent.statusCode).toBe(400);

        expect(noUserId.body).toEqual({ error: "Please enter a user ID for the post." });
        expect(noSongLink.body).toEqual({ error: "Please add a song link for the post." });
        expect(noContent.body).toEqual({ error: "Please provide content for the post." });
    });

    it("should create a post successfully", async () =>
    {
        const mockPost = 
        {
            user_id: "UserID", 
            song_link: "https://www.example.com", 
            content: "This is a test post."
        };
        
        createPost.mockResolvedValue({ success: true, message: "Post created successfully.", post: mockPost });

        const res = await request(app).post("/create-post").send(mockPost);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(mockPost);
    });

    it("should handle errors during post creation", async () => {
        //createPost.mockResolvedValue({ success: false, message: "Could not create the post. Please try again later." });
        createPost.mockRejectedValue(new Error("Server error"));
        
        const res = await request(app).post("/create-post").send(
        { 
            user_id: "ErrorUserId",
            song_link: "https://www.example.com",
            content: "A post that will fail."
        });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Internal server error." });
    });
});
