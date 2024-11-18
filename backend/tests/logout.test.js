const express = require("express");
const request = require("supertest");
const router = require("../routes/logout.js");

const app = express();
app.use(express.json());
app.use("/", router);

describe("POST /", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 200 and success message on successful logout", async () => {
        const response = await request(app).post("/");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: "Logged Out Sucessfully" });
    });
});
