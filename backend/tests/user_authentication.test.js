const request = require("supertest");
const express = require("express");
const router = require("../routes/user_authentication.js");
const { userEmailExists } = require("../utils/user.js");
const User = require("../models/user.js");

jest.mock("../utils/user.js");
jest.mock("../models/user.js");

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /user/authenticate", () => {

    it("should return 400 if email is missing", async () => {
        const res = await request(app).post("/user/authenticate").send({ password: "password123", userID: 'userID' });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Missing required parameters" });
    });

    it("should return 404 if user does not exist", async () => {
        userEmailExists.mockResolvedValue(false); // Mock the async function to return false

        const res = await request(app).post("/user/authenticate").send({ email: "test@test.com", password: "password123", userID: 'userID' });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: "User does not exist" });
    });

    it("should return 401 for invalid email or password", async () => {
        userEmailExists.mockResolvedValue(true); // User exists
        User.findOne.mockResolvedValue({ email: "test@test.com", password: "password123" });

        const res = await request(app).post("/user/authenticate").send({ email: "wrong@test.com", password: "wrongPassword", userID: 'userID' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ error: "Invalid email or password" });
    });

    it("should return 200 for successful authentication", async () => {
        userEmailExists.mockResolvedValue(true);
        User.findOne.mockResolvedValue({ email: "test@test.com", password: "password123" });

        const res = await request(app).post("/user/authenticate").send({ email: "test@test.com", password: "password123", userID: 'userID' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: "user has been authenticated" });
    });

    it("should return 500 for an internal server error", async () => {
        userEmailExists.mockResolvedValue(true);
        User.findOne.mockRejectedValue(new Error("Database error")); // Simulate server error

        const res = await request(app).post("/user/authenticate").send({ email: "test@test.com", password: "password123", userID: 'userID' });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Server error" });
    });

});
