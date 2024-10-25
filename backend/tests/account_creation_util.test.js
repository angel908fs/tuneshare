const createAccount = require("../utils/account_creation.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

jest.mock("../models/user.js"); // Mock the User model
jest.mock("bcrypt"); // Mock bcrypt for password hashing

describe("createAccount", () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore(); // Restore console.error after each test
    });

    it("should successfully create a new user", async () => {
        const mockHashedPassword = "hashedPassword123";
        const mockSavedUser = {
            _id: "12345",
            username: "testuser",
            email: "test@example.com",
            password: mockHashedPassword,
            save: jest.fn().mockResolvedValue(true) // Mock the save method to resolve
        };

        // Mock bcrypt.hash to return a fake hashed password
        bcrypt.hash.mockResolvedValue(mockHashedPassword);

        // Mock the User constructor to return the mock user
        User.mockImplementation(() => mockSavedUser);

        const result = await createAccount("testuser", "test@example.com", "password123");

        // Assertions
        expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10); // Verify bcrypt was called with the correct password
        expect(mockSavedUser.save).toHaveBeenCalledTimes(1); // Ensure save is called
        expect(result).toEqual({
            success: true,
            message: "Account created successfully.",
            user: mockSavedUser
        });
    });

    it("should return an error when the user could not be created", async () => {
        const mockError = new Error("Database error");

        // Mock bcrypt.hash to return a fake hashed password
        bcrypt.hash.mockResolvedValue("hashedPassword123");

        // Mock the User constructor to throw an error during save
        User.mockImplementation(() => ({
            save: jest.fn().mockRejectedValue(mockError)
        }));

        const result = await createAccount("testuser", "test@example.com", "password123");

        // Assertions
        expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10); // Verify bcrypt was called with the correct password
        expect(result).toEqual({
            success: false,
            message: "Could not create an account for testuser. Please try again later."
        });
    });

    it("should handle bcrypt hash errors gracefully", async () => {
        const mockHashError = new Error("Hashing error");

        // Mock bcrypt.hash to throw an error
        bcrypt.hash.mockRejectedValue(mockHashError);

        const result = await createAccount("testuser", "test@example.com", "password123");

        // Assertions
        expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10); // Verify bcrypt was called with the correct password
        expect(result).toEqual({
            success: false,
            message: "Could not create an account for testuser. Please try again later."
        });
    });
});
