jest.mock("../models/post.js");
jest.mock("../models/user.js");

const express = require("express");
const request = require("supertest");
const router = require("../routes/likes.js");
const Post = require("../models/post.js");
const User = require("../models/user.js");

const app = express();
app.use(express.json());
app.use("/", router);

const postID = "123";
const userID = "456";

describe("POST /like", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if postID or userID is missing", async () => {
    const res = await request(app).post("/like").send({ postID });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Missing required parameter: userID",
    });
  });

  it("should return 404 if the post does not exist", async () => {
    // Simulate post not found
    Post.findOne.mockResolvedValueOnce(null);
    const res = await request(app).post("/like").send({ postID, userID });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Post does not exist",
    });
  });

  it("should return 404 if the user does not exist", async () => {
    const mockPost = { post_id: postID, likes: 5, save: jest.fn().mockResolvedValue() };
    Post.findOne.mockResolvedValueOnce(mockPost);
    User.findOne.mockResolvedValueOnce(null);
    const res = await request(app).post("/like").send({ postID, userID });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "User does not exist",
    });
  });

  it("should return 200 if the post is already liked", async () => {
    const mockUser = {
      user_id: userID,
      liked_posts: [postID],
      save: jest.fn().mockResolvedValue(),
    };
    const mockPost = {
      post_id: postID,
      likes: 5,
      save: jest.fn().mockResolvedValue(),
    };
    Post.findOne.mockResolvedValueOnce(mockPost);
    User.findOne.mockResolvedValueOnce(mockUser);
    
    const res = await request(app).post("/like").send({ postID, userID });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Post already liked by user",
    });
  });

  it("should increment likes if the post exists and user has not liked it", async () => {
    const mockUser = {
      user_id: userID,
      liked_posts: [],
      save: jest.fn().mockResolvedValue(),
    };
    const mockPost = {
      post_id: postID,
      likes: 5,
      save: jest.fn().mockResolvedValue(),
    };
    Post.findOne.mockResolvedValueOnce(mockPost);
    User.findOne.mockResolvedValueOnce(mockUser);

    const res = await request(app).post("/like").send({ postID, userID });
    expect(res.statusCode).toBe(200);
    // The router should have pushed the postID into liked_posts
    expect(mockUser.liked_posts.includes(postID)).toBe(true);
    // And incremented the post's like count
    expect(mockPost.likes).toBe(6);
    expect(res.body).toEqual({
      success: true,
      message: "Post liked successfully",
    });
  });
});

describe("POST /unlike", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if postID or userID is missing", async () => {
    const res = await request(app).post("/unlike").send({ postID });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Missing required parameter: userID",
    });
  });

  it("should return 404 if the post does not exist", async () => {
    Post.findOne.mockResolvedValueOnce(null);
    const res = await request(app).post("/unlike").send({ postID, userID });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Post does not exist",
    });
  });

  it("should return 404 if the user does not exist", async () => {
    const mockPost = { post_id: postID, likes: 5, save: jest.fn().mockResolvedValue() };
    Post.findOne.mockResolvedValueOnce(mockPost);
    User.findOne.mockResolvedValueOnce(null);
    const res = await request(app).post("/unlike").send({ postID, userID });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "User does not exist",
    });
  });

  it("should return 400 if user has not liked the post", async () => {
    const mockUser = {
      user_id: userID,
      liked_posts: [],
      save: jest.fn().mockResolvedValue(),
    };
    const mockPost = {
      post_id: postID,
      likes: 5,
      save: jest.fn().mockResolvedValue(),
    };
    Post.findOne.mockResolvedValueOnce(mockPost);
    User.findOne.mockResolvedValueOnce(mockUser);
    
    const res = await request(app).post("/unlike").send({ postID, userID });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Cannot unlike a post that has not been liked",
    });
  });

  it("should decrement likes if the post exists and user has liked it", async () => {
    const mockUser = {
      user_id: userID,
      liked_posts: [postID],
      save: jest.fn().mockResolvedValue(),
    };
    const mockPost = {
      post_id: postID,
      likes: 5,
      save: jest.fn().mockResolvedValue(),
    };
    Post.findOne.mockResolvedValueOnce(mockPost);
    User.findOne.mockResolvedValueOnce(mockUser);

    const res = await request(app).post("/unlike").send({ postID, userID });
    expect(res.statusCode).toBe(200);
    expect(mockUser.liked_posts.includes(postID)).toBe(false);
    expect(mockPost.likes).toBe(4);
    expect(res.body).toEqual({
      success: true,
      message: "Post unliked successfully",
    });
  });
});
