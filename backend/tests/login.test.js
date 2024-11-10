const request = require("supertest");
const express = require("express");
const router = require("../routes/login.js");
const { userEmailExists } = require("../utils/user.js");
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const { generateTokenAndSetCookie } = require("../utils/generateToken.js");

jest.mock("../utils/user.js");
jest.mock("../models/user.js");
jest.mock('../utils/generateToken.js',()=>({
    generateTokenAndSetCookie : jest.fn(),
}));
jest.mock("bcryptjs"); // Mock bcrypt functions

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /login", () => {

    it("should return 400 if email is missing", async () => {
        const res = await request(app).post("/login").send({ password: "password123", userID: 'userID' });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ success: false, message: "Missing required parameters" });
    });

    it("should return 404 if user does not exist", async () => {
        userEmailExists.mockResolvedValue(false);

        const res = await request(app).post("/login").send({ email: "test@test.com", password: "password123", userID: 'userID' });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ success: false, message: "User does not exist" });
    });

    it("should return 401 for invalid email or password", async () => {
        userEmailExists.mockResolvedValue(true);
        User.findOne.mockResolvedValue({ email: "test@test.com", password: "hashedPassword123" });
        bcrypt.compare.mockResolvedValue(false); // Simulate password mismatch

        const res = await request(app).post("/login").send({ email: "test@test.com", password: "wrongPassword", userID: 'userID' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ success: false, message: "Invalid email or password" });
    });

    it("should return 200 for successful authentication", async () => {
        userEmailExists.mockResolvedValue(true);
        User.findOne.mockResolvedValue({user_id: "userid", email: "test@test.com", password: "hashedPassword123" });
        bcrypt.compare.mockResolvedValue(true); // Simulate successful password match

        const res = await request(app).post("/login").send({ email: "test@test.com", password: "password123", userID: 'userID' });

        expect(generateTokenAndSetCookie).toHaveBeenCalledWith({user_id: "userid", email: "test@test.com"},expect.any(Object));
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: true, message: "user has been authenticated" });
        
    });

    it("should return 500 for an internal server error", async () => {
        userEmailExists.mockResolvedValue(true);
        User.findOne.mockRejectedValue(new Error("Database error")); // Simulate server error

        const res = await request(app).post("/login").send({ email: "test@test.com", password: "password123", userID: 'userID' });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ success: false, message: "Server error" });
    });
});
