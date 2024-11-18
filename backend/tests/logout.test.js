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
        expect(response.body).toEqual({ success: "Logged Out Successfully" }); // Corrected the typo

        // check that the cookie has been cleared
        expect(response.headers['set-cookie'][0]).toMatch(/tuneshare_cookie=;/);
        expect(response.headers['set-cookie'][0]).toMatch(/Path=\//);
    });

    it("should return 500 and an error message on server error", async () => {
        // simulate a server error by temporarily overriding res.clearCookie
        const originalClearCookie = express.response.clearCookie;
        express.response.clearCookie = () => { throw new Error('Test error'); };

        const response = await request(app).post("/");
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal Server Error' });

        // restore the original function
        express.response.clearCookie = originalClearCookie;
    });
});
