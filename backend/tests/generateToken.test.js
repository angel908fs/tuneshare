const jwt = require("jsonwebtoken");
const { generateTokenAndSetCookie } = require("../utils/generateToken"); // Adjust the path as needed

describe("generateTokenAndSetCookie", () => {
    beforeAll(() =>{
        process.env.JWT_SECRET = "testsecret";
    });

    it("should set a JWT token cookie with correct options", () => {
        const mockUserId = "testUserId";
        const mockEmail = "test@example.com";
        
        // set environment to development to check 'secure: false'
        process.env.NODE_ENV = "development";  // Set environment to development

        // Mock the `res` object with a `cookie` method
        const res = {
            cookie: jest.fn(),
        };

        // Call the function
        generateTokenAndSetCookie(mockUserId, mockEmail, res);

        // Capture the token and verify payload
        const token = res.cookie.mock.calls[0][1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded.user_id).toBe(mockUserId);
        expect(decoded.email).toBe(mockEmail);

        // Check the cookie was set with correct properties
        expect(res.cookie).toHaveBeenCalledWith("jwt", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development", // Because NODE_ENV is 'development'
        });
    });
});
