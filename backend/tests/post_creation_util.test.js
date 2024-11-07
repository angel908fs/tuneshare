const { createPost, getUserPosts } = require("../utils/post.js");
const User = require("../models/user.js");
const Post = require("../models/post.js");
jest.mock("../models/post.js");
jest.mock("../models/user.js");

describe("Post Utility Functions", () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    it("should create a post successfully", async () =>
    {
        const mockPost = 
        {
            user_id: "user123",
            song_link: "https://spotify.com/song1", 
            content: "Here's a song I just listened to!",
            comments: []
        };

        Post.prototype.save = jest.fn().mockResolvedValue(mockPost);

        const result = await createPost("user123", "https://spotify.com/song1", "Here's a song I just listened to!");
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockPost);
    });

    it("should handle errors when creating a post", async () =>
    {
        Post.prototype.save = jest.fn().mockRejectedValue(new Error("Internal Error"));

        const result = await createPost("user345", "https://spotify.com/song2", "Another one.");
        expect(result.success).toBe(false);
        expect(result.message).toBe("Could not create the post. Please try again later.");
    });

    it("should retrieve user posts successfully", async () =>
    {
        const mockUser = { username: "user123", user_id: "foobar" };
        const mockPost =
        [
            { user_id: "foobar", song_link: "https://spotify.com/song3", content: "What a great song!" }
        ];

        User.findOne.mockResolvedValue(mockUser);
        Post.find.mockReturnValue(
        {   
            populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockPost) })
        });

        const result = await getUserPosts("user123");

        expect(result.success).toBe(true);
        expect(result.post).toEqual(mockPost);
    });

    it("should handle errors when retrieving posts", async () =>
    {
        Post.find = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ exec: jest.fn().mockRejectedValue(new Error("Server Error")) }) });

        const result = await getUserPosts("user123");
        expect(result.success).toBe(false);
        expect(result.message).toBe("Could not retrieve posts. Please try again later.");
    });

    it("should error outwhen reading posts without a username", async () =>
    {
        User.findOne.mockResolvedValue(null);

        const result = await getUserPosts("");
        
        expect(result.success).toBe(false);
        expect(result.message).toBe("This username does not exist.");
    });
});
