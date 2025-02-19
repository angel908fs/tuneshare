const express = require("express");
const request = require("supertest");
const router = require("../routes/comments.js");
const User = require("../models/user.js");
const Post = require("../models/post.js");
const Comment = require("../models/comment.js");

jest.mock("../models/user.js");
jest.mock("../models/post.js");
jest.mock("../models/comment.js");

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /post-comment", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it("should return 400 if comment is missing", async () => {
        const res = await request(app).post("/post-comment").send({ userID: "123", postID: "456" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "missing required parameter: comment" });
    });

    it("should return 400 if userID is missing", async () => {
        const res = await request(app).post("/post-comment").send({ comment: "Test comment", postID: "456" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "missing required parameter: userID" });
    });

    it("should return 400 if postID is missing", async () => {
        const res = await request(app).post("/post-comment").send({ comment: "Test comment", userID: "123" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "missing required parameter: postID" });
    });

    it("should return 404 if user does not exist", async () => {
        User.findOne.mockResolvedValue(null);
        const res = await request(app).post("/post-comment").send({ comment: "Test comment", userID: "123", postID: "456" });
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: "user does not exist" });
    });

    it("should return 404 if post does not exist", async () => {
        User.findOne.mockResolvedValue({ user_id: "123", comments: [] });
        Post.findOne.mockResolvedValue(null);
        const res = await request(app).post("/post-comment").send({ comment: "Test comment", userID: "123", postID: "456" });
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: "post does not exist" });
    });

    it("should return 200 if comment is posted successfully", async () => {
        User.findOne.mockResolvedValue({
            user_id: "123",
            comments: [],
            save: jest.fn().mockResolvedValue()
        });
    
        Post.findOne.mockResolvedValue({
            post_id: "456",
            comments: [],
            save: jest.fn().mockResolvedValue() 
        });
    
        Comment.prototype.save = jest.fn().mockResolvedValue({ comment_id: "789" });
    
        const res = await request(app).post("/post-comment").send({ 
            comment: "Test comment", 
            userID: "123", 
            postID: "456" 
        });
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: true, message: "comment posted successfully" });
    });
    

    it("should return 500 if there is a server error", async () => {
        User.findOne.mockRejectedValue(new Error("Database error"));
        const res = await request(app).post("/post-comment").send({ comment: "Test comment", userID: "123", postID: "456" });
        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("server error");
        expect(res.body.error).toBe("Database error");
    });
});
