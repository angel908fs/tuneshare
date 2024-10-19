const request = require("supertest");
const express = require("express");
const router = require("../routes/user_authentication.js"); // Adjust the path to your router
const userExists = require("../utils/user.js"); // Adjust the path to your utility
const User = require("../models/user.js"); // Adjust the path to your User model

jest.mock("../utils/user.js");
jest.mock("../models/User");

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /user/authenticate", () => {
    
    it("should return 404 if user does not exist", async () => {
        userExists.mockReturnValue(false);

        const res = await request(app).post("/user/authenticate").query({ email: "test@test.com", password: "password123" }).send();

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: "user does not exist" });
    });

    it("should return 401 for invalid email or password", async () => {
        userExists.mockReturnValue(true);
        User.findOne.mockResolvedValue({ email: "test@test.com", password: "password123" });

        const res = await request(app).post("/user/authenticate").query({ email: "wrong@test.com", password: "wrongPassword" }).send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ error: "invalid email or password" });
    });

    it("should return 200 for successful authentication", async () => {
        userExists.mockReturnValue(true);
        User.findOne.mockResolvedValue({ email: "test@test.com", password: "password123" });

        const res = await request(app).post("/user/authenticate").query({ email: "test@test.com", password: "password123" }).send();

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: "user has been authenticated" });
    });
});
