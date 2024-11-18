const request = require("supertest");
const express = require("express");
const router = require("../routes/signup.js");
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/generateToken.js");

jest.mock("../models/user.js");
jest.mock("../utils/generateToken.js");
jest.mock("bcryptjs");

const app = express();
app.use(express.json());
app.use(router);

describe("POST /signup", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if email is missing", async () => {
        const response = await request(app)
            .post("/signup")
            .send({ username: "testuser", password: "password123" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "Missing required parameters" });
    });

    it("should return 400 if password is missing", async () => {
        const response = await request(app)
            .post("/signup")
            .send({ username: "testuser", email: "test@example.com" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "Missing required parameters" });
    });

    it("should return 400 if username is missing", async () => {
        const response = await request(app)
            .post("/signup")
            .send({ email: "test@example.com", password: "password123" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "Missing required parameters" });
    });

    it("should return 400 if email format is invalid", async () => {
        const response = await request(app)
            .post("/signup")
            .send({ username: "testuser", email: "invalid-email", password: "password123" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "invalid email format" });
    });

    it("should return 400 if password is less than 6 characters", async () => {
        const response = await request(app)
            .post("/signup")
            .send({ username: "testuser", email: "test@example.com", password: "123" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, message: "Password must be at least 6 characters long" });
    });

    it("should return 409 if the username already exists", async () => {
        User.findOne.mockResolvedValueOnce({ username: "existinguser" });

        const response = await request(app)
            .post("/signup")
            .send({ username: "existinguser", email: "test@example.com", password: "password123" });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            success: false,
            message: "This username is already taken by another account. Please use another one."
        });
    });

    it("should return 409 if the email already exists", async () => {
        User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ email: "existing@example.com" });

        const response = await request(app)
            .post("/signup")
            .send({ username: "testuser", email: "existing@example.com", password: "password123" });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            success: false,
            message: "This email is already associated with an account. Please use another one."
        });
    });

    it("should create an account if username and email are available and password is valid, and return a token", async () => {
        User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

        const mockUser = {
            username: "testuser",
            email: "test@example.com",
            user_id: "generated_user_id",
            save: jest.fn().mockResolvedValue(true),
        };
        User.mockImplementation(() => mockUser);

        bcrypt.hash.mockResolvedValue("hashedPassword123");
        generateToken.mockReturnValue("mockedToken");

        const response = await request(app)
            .post("/signup")
            .send({ username: "testuser", email: "test@example.com", password: "password123" });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            success: true,
            message: "user has been created successfully",
            data: {
                username: "testuser",
                email: "test@example.com",
                user_id: "generated_user_id",
                jwt_token: "mockedToken",
            }
        });
        expect(mockUser.save).toHaveBeenCalled();
        expect(generateToken).toHaveBeenCalledWith("generated_user_id");
    });

    it("should return 500 if there is a server error", async () => {
        User.findOne.mockRejectedValueOnce(new Error("Server error"));

        const response = await request(app)
            .post("/signup")
            .send({ username: "testuser", email: "test@example.com", password: "password123" });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ success: false, message: "Server error", error: "Server error" });
    });
});
