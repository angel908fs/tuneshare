const createAccount = require("../models/user_creation.js");
const User = require("../models/user.js");
jest.mock("../models/user.js");

describe("createAccount", () =>
{
    
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    it("should create a new user successfully", async () =>
    {
        User.findOne.mockResolvedValue(null); // No conflicts
        User.prototype.save = jest.fn().mockResolvedValue(true); // Simulate save

        const result = await createAccount("A", "a@example.com", "password123");
        
        expect(result).toEqual(
        {
            success: true,
            message: "Account created successfully.",
            user: expect.any(Object),
        });
    });

    it("should error if the username is taken", async () =>
    {
        User.findOne.mockResolvedValueOnce({ username: "A" }); // Username conflict

        const result = await createAccount("A", "b@example.com", "password123");
        
        expect(result).toEqual(
        {
            success: false,
            message: "This username is already taken by another account. Please user another one.",
        });
    });

    it("should error if the email already exists", async () =>
    {
        User.findOne.mockResolvedValueOnce(null); // No username conflict
        User.findOne.mockResolvedValueOnce({ email: "a@example.com" }); // Email conflict

        const result = await createAccount("B", "a@example.com", "password123");
        
        expect(result).toEqual(
        {
            success: false,
            message: "This email is already ascociated with an account. Please use another one.",
        });
    });

    it("should handle errors gracefully", async () =>
    {
        User.findOne.mockRejectedValue(new Error("Database error")); // Simulate database failure

        const result = await createAccount("C", "c@example.com", "password123");
        
        expect(result).toEqual(
        {
            success: false,
            message: "Could not create an account for C. Please try again later.",
        });
    });
});
