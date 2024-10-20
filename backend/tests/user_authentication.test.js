const request = require("supertest");
const express = require("express");
const router = require("../routes/user_authentication.js"); 
const userExists = require("../utils/user.js");
const User = require("../models/user.js");

jest.mock("../utils/user.js");
jest.mock("../models/User");

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /user/authenticate", () => {

    it("should return 400 if userID is missing", async () => {
        // simulate a request to the route specified
        const res = await request(app).post("/user/authenticate").send({ email: "test@test.com", password: "password123" });
        
        // assert response data
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Missing required parameters" });
    });

    it("should return 400 if email is missing", async () => {
        const res = await request(app).post("/user/authenticate").send({ password: "password123", userID: 'userID' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Missing required parameters" });
    });

    it("should return 400 if password is missing", async () => {
        const res = await request(app).post("/user/authenticate").send({ email: "test@test.com", userID: 'userID' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Missing required parameters" });
    });

    it("should return 404 if user does not exist", async () => {
        // this is what the userExists function returns for this test 
        userExists.mockReturnValue(false);

        const res = await request(app).post("/user/authenticate").send({ email: "test@test.com", password: "password123", userID: 'userID' });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: "User does not exist" });
    });

    it("should return 401 for invalid email or password", async () => {
        // this is what the userExists function returns for this test 
        userExists.mockReturnValue(true);
        // this is what the findOne function of the User model returns for this test
        User.findOne.mockResolvedValue({ email: "test@test.com", password: "password123" });

        const res = await request(app).post("/user/authenticate").send({ email: "wrong@test.com", password: "wrongPassword", userID: 'userID' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ error: "Invalid email or password" });
    });

    it("should return 200 for successful authentication", async () => {
        userExists.mockReturnValue(true);
        User.findOne.mockResolvedValue({ email: "test@test.com", password: "password123" });

        const res = await request(app).post("/user/authenticate").send({ email: "test@test.com", password: "password123", userID: 'userID' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ success: "user has been authenticated" });
    });
});
