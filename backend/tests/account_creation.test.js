const request = require("supertest");
const express = require("express");
const router = require("../routes/account_creation.js");
const { userNameExists, userEmailExists } = require("../utils/user.js");
const createAccount = require("../utils/account_creation.js");


jest.mock("../utils/user.js"); // Mock the user utility functions
jest.mock("../utils/account_creation.js"); // Mock the account creation function

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(router); // Use the router

describe("POST /user/create", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks between tests
    });

    it("should return 400 if any required parameters are missing", async () => {
        const response = await request(app)
            .post("/user/create")
            .send({ username: "testuser", email: "test@example.com" }); // Missing password

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Missing required parameters" });
    });

    it("should return a conflict message if the username already exists", async () => {
        // Mock userNameExists to return true, indicating the username is taken
        userNameExists.mockResolvedValue(true);
        userEmailExists.mockResolvedValue(false); // Email is not taken

        const response = await request(app)
            .post("/user/create")
            .send({ username: "existinguser", email: "test@example.com", password: "password123" });

        expect(response.status).toBe(200); // Assuming the route returns success with a conflict message in JSON
        expect(response.body).toEqual({
            success: false,
            message: "This username is already taken by another account. Please user another one."
        });
        expect(userNameExists).toHaveBeenCalledWith("existinguser");
    });

    it("should return a conflict message if the email already exists", async () => {
        // Mock userEmailExists to return true, indicating the email is taken
        userNameExists.mockResolvedValue(false);
        userEmailExists.mockResolvedValue(true); // Email is taken

        const response = await request(app)
            .post("/user/create")
            .send({ username: "testuser", email: "existing@example.com", password: "password123" });

        expect(response.status).toBe(200); // Assuming the route returns success with a conflict message in JSON
        expect(response.body).toEqual({
            success: false,
            message: "This email is already ascociated with an account. Please use another one."
        });
        expect(userEmailExists).toHaveBeenCalledWith("existing@example.com");
    });

    it("should create an account if the username and email are available", async () => {
        // Mock userNameExists and userEmailExists to return false, indicating they are available
        userNameExists.mockResolvedValue(false);
        userEmailExists.mockResolvedValue(false);
        createAccount.mockResolvedValue({
            success: true,
            message: "Account created successfully.",
            user: { username: "testuser", email: "test@example.com" }
        });

        const response = await request(app)
            .post("/user/create")
            .send({ username: "testuser", email: "test@example.com", password: "password123" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Account created successfully.",
            user: { username: "testuser", email: "test@example.com" }
        });
        expect(userNameExists).toHaveBeenCalledWith("testuser");
        expect(userEmailExists).toHaveBeenCalledWith("test@example.com");
        expect(createAccount).toHaveBeenCalledWith("testuser", "test@example.com", "password123");
    });

    it("should return 500 if there is a server error", async () => {
        // Mock userNameExists to throw an error to simulate a server error
        userNameExists.mockRejectedValue(new Error("Server error"));

        const response = await request(app)
            .post("/user/create")
            .send({ username: "testuser", email: "test@example.com", password: "password123" });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Server error" });
    });
});
