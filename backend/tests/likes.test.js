const express = require("express");
const request = require("supertest");
const router = require("../routes/likes.js"); 
jest.mock("../models/post.js"); 

const Post = require("../models/post.js");

const app = express();
app.use(express.json());
app.use("/", router);

const postID = "123";

describe("POST /like", () => {
    beforeEach(() => {
        jest.clearAllMocks(); 
    });

    it("should return 400 if postID is missing", async () => {
        const res = await request(app).post("/like").send({}); // no postID was given, should not proceed

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({success: false, message: "Missing required parameter: postID"});
    });

    it("should return 404 if the post does not exist", async () => {
        Post.findOne.mockResolvedValueOnce(null); 

        const res = await request(app).post("/like").send({postID: postID});

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({success: false, message: "Post does not exist"});
    });

    it("should return 200 and increment likes if the post exists", async () => {
        const mockPost = {post_id: postID, likes: 5, save: jest.fn() };
        Post.findOne.mockResolvedValueOnce(mockPost); 

        const res = await request(app).post("/like").send({postID: postID});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({success: true, message: "post liked successfully"});

        expect(mockPost.likes).toBe(6);
        expect(mockPost.save).toHaveBeenCalled();
    });

    it("should return 500 if there is a server error", async () => {
        Post.findOne.mockRejectedValueOnce(new Error("Database error"));

        const res = await request(app).post("/like").send({postID: postID});

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({success: false, message: "Server error", error: "Database error"});
    });
});

describe("POST /unlike", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if postID is missing", async () => {
        const res = await request(app).post("/unlike").send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({success: false, message: "Missing required parameter: postID"});
    });

    it("should return 404 if the post does not exist", async () => {
        Post.findOne.mockResolvedValueOnce(null); 

        const res = await request(app).post("/unlike").send({postID: postID});

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({success: false, message: "Post does not exist"});
    });

    it("should return 200 and decrement likes if the post exists and likes > 0", async () => {
        const mockPost = {post_id: postID, likes: 5, save: jest.fn() };
        Post.findOne.mockResolvedValueOnce(mockPost); 

        const res = await request(app).post("/unlike").send({postID: postID});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({success: true, message: "post unliked successfully"});

        expect(mockPost.likes).toBe(4);
        expect(mockPost.save).toHaveBeenCalled();
    });

    it("should not decrement likes below 0", async () => {
        const mockPost = {post_id: postID, likes: 0, save: jest.fn() };
        Post.findOne.mockResolvedValueOnce(mockPost);

        const res = await request(app).post("/unlike").send({postID: postID});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({success: true, message: "post unliked successfully"});

        expect(mockPost.likes).toBe(0);
        expect(mockPost.save).toHaveBeenCalled();
    });

    it("should return 500 if there is a server error", async () => {
        Post.findOne.mockRejectedValueOnce(new Error("Database error"));

        const res = await request(app).post("/unlike").send({postID: postID});

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({success: false, message: "Server error", error: "Database error"});
    });
});

describe("GET /like", () => {
    beforeEach(() => {
        jest.clearAllMocks(); 
    });

    it("should return 400 if postID is missing", async () => {
        const res = await request(app).get("/like-count").send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({success: false, message: "Missing required parameter: postID"});
    });

    it("should return 404 if the post does not exist", async () => {
        Post.findOne.mockResolvedValueOnce(null);

        const res = await request(app).get("/like-count").send({postID: postID});

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({success: false, message: "Post does not exist"});
    });

    it("should return 200 and the like count if the post exists", async () => {
        const mockPost = {post_id: postID, likes: 10};
        Post.findOne.mockResolvedValueOnce(mockPost); 

        const res = await request(app).get("/like-count").send({postID: postID});

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({success: true, message: "like count retrieved successfully", data: {likes: 10}});
    });

    it("should return 500 if there is a server error", async () => {
        // Simulate a database error
        Post.findOne.mockRejectedValueOnce(new Error("Database error"));

        const res = await request(app).get("/like-count").send({postID: postID});

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({success: false, message: "Server error", error: "Database error"});
    });
});