const request = require("supertest");
const express = require("express");
const router = require("../routes/user_search.js");
const User = require("../models/user.js");

jest.mock("../models/user.js");

const app = express();
app.use(express.json());
app.use(router);

describe("POST /user-search", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if username is missing", async () => {
        const response = await request(app)
            .post("/user-search")
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "missing username in request body"
        });
    });

    it("should return 200 with matching users", async () => {
        const mockUsers = [
            {
                username: "john_doe",
                user_id: "user1",
                followers_count: 100,
                following_count: 50,
            },
            {
                username: "johnny_b",
                user_id: "user2",
                followers_count: 200,
                following_count: 75,
            }
        ];

        User.find.mockReturnValue({
            limit: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUsers),
            }),
        });

        const response = await request(app)
            .post("/user-search")
            .send({ username: "john" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "users retrieved succesfully",
            data: mockUsers
        });
    });

    it("should return 200 with no matches if no users are found", async () => {
        User.find.mockReturnValue({
            limit: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue([]),
            }),
        });

        const response = await request(app)
            .post("/user-search")
            .send({ username: "nonexistent" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "users retrieved succesfully",
            data: []
        });
    });

    it("should return 500 if there is a server error", async () => {
        User.find.mockReturnValue({
            limit: jest.fn().mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error("Database error")),
            }),
        });

        const response = await request(app)
            .post("/user-search")
            .send({ username: "john" });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Internal server error",
            error: "Database error"
        });
    });
});
