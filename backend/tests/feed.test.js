const express = require("express");
const router = require("../path/to/your/router"); // Path to your actual router file
const User = require("../models/user");
const Post = require("../models/post");

jest.mock("../models/user");
jest.mock("../models/post");

describe("POST /load-feed", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return 400 if userid is missing", async () => {
    req.body = { page: 1 };

    await router(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      sucess: false,
      message: "missing user id in request body",
    });
  });

  it("should return 400 if page is missing", async () => {
    req.body = { userid: "12345" };

    await router(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "missing page in request body",
    });
  });

  it("should return 400 if page is less than 1", async () => {
    req.body = { userid: "12345", page: 0 };

    await router(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "page parameter must be greater than or equal to 1",
    });
  });

  it("should return 404 if user is not found", async () => {
    req.body = { userid: "12345", page: 1 };

    User.findOne.mockResolvedValue(null);

    await router(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "user not found",
    });
  });

  it("should return 404 if no posts are found", async () => {
    req.body = { userid: "12345", page: 1 };

    User.findOne.mockResolvedValue({ following: ["user1", "user2"] });
    Post.find.mockResolvedValue([]);

    await router(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "no posts available at the time",
    });
  });

  it("should return 200 with posts", async () => {
    req.body = { userid: "12345", page: 1 };

    User.findOne.mockResolvedValue({ following: ["user1", "user2"] });
    const mockPosts = [
      { user_id: "user1", created_at: "2024-10-01T00:00:00Z" },
      { user_id: "user2", created_at: "2024-10-02T00:00:00Z" },
    ];
    Post.find.mockResolvedValue(mockPosts);

    await router(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      data: mockPosts,
    });
  });

  it("should return 500 on internal server error", async () => {
    req.body = { userid: "12345", page: 1 };

    User.findOne.mockRejectedValue(new Error("Database error"));

    await router(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "internal server error",
      error: expect.any(Error),
    });
  });
});
