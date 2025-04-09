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
                toObject: () => ({
                    username: "john_doe",
                    user_id: "user1",
                    followers_count: 100,
                    following_count: 50
                })
            },
            {
                username: "johnny_b",
                user_id: "user2",
                followers_count: 200,
                following_count: 75,
                toObject: () => ({
                    username: "johnny_b",
                    user_id: "user2",
                    followers_count: 200,
                    following_count: 75
                })
            }
        ];
        
        User.findOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({ following: ["user1"] })
        });

        User.find.mockReturnValueOnce({
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockUsers)
        });


        const response = await request(app)
            .post("/user-search")
            .send({ username: "john", viewer_id: "viewer123"});


        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "users retrieved succesfully",
            data: [
                {
                username: "john_doe",
                user_id: "user1",
                followers_count: 100,
                following_count: 50,
                isFollowing: true,
                },
                {
                    username: "johnny_b",
                user_id: "user2",
                followers_count: 200,
                following_count: 75,
                isFollowing: false,
                }
            ]
        });
    });

    it("should return 200 with no matches if no users are found", async () => {
        User.findOne.mockReturnValueOnce({ 
            select: jest.fn().mockResolvedValue ({ following: [] }),
        });

        User.find.mockReturnValueOnce({
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue([]),
        });
        
        const response = await request(app)
            .post("/user-search")
            .send({ username: "nonexistent", viewer_id: "viewer123" });

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

        User.findOne.mockResolvedValueOnce({ following: [] });

        const response = await request(app)
            .post("/user-search")
            .send({ username: "john", viewer_id: "viewer123" });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Internal server error",
            error: "Database error"
        });
    });
    it("should return 400 if viewer_id is missing", async() => {
        const response = await request(app)
            .post("/user-search")
            .send({username: "john"});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "missing viewer_id in request body"
        });
    });
    it("should return 200 with matching users and isFollowing flags",async() => {
        const mockUsers = [
            {
                username: "john_doe",
                user_id: "user1",
                followers_count: 100,
                following_count: 50,
                toObject: function(){
                    return{
                        username: this.username,
                        user_id: this.user_id,
                        followers_count: this.followers_count,
                        following_count: this.following_count
                    };
                }
            },
            {
                username: "johnny_b",
                user_id: "user2",
                followers_count: 200,
                following_count: 75,
                toObject: function (){
                    return{
                        username: this.username,
                        user_id: this.user_id,
                        followers_count: this.followers_count,
                        following_count: this.following_count
                    };
                }
            }
        ]; 
        
        User.findOne.mockReturnValueOnce({
            select: jest.fn().mockResolvedValue({ following: ["user1"] })
        });

        User.find.mockReturnValueOnce({
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockUsers),
        });
        

        const response = await request(app)
            .post("/user-search")
            .send({username: "john",viewer_id: "viewer123" });
        console.log("Debug:", response.body);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([
            {
                username: "john_doe",
                user_id: "user1",
                followers_count: 100,
                following_count: 50,
                isFollowing: true,
            },
            {
                username: "johnny_b",
                user_id: "user2",
                followers_count: 200,
                following_count: 75,
                isFollowing: false,
            }
        ]);
    });

    it("should return 200 with no matches if no users are found", async () => {
        const mockUsers = [
            {
                username: "john_doe",
                user_id: "user1",
                followers_count: 100,
                following_count: 50,
                toObject: function () {
                    return { ...this };
                },
            },
            {
                username: "johnny_b",
                user_id: "user2",
                followers_count: 200,
                following_count: 75,
                toObject: function () {
                    return { ...this };
                },
            }
        ];

        User.findOne.mockReturnValueOnce({ 
            select: jest.fn().mockResolvedValue({ following: ["user1"] }),
        });

        User.find.mockReturnValueOnce({
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockUsers),
        });
    
        const response = await request(app)
            .post("/user-search")
            .send({ username: "john", viewer_id: "viewer123" });
    
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([
            { 
                username: "john_doe",
                user_id: "user1",
                followers_count: 100,
                following_count: 50,
                isFollowing: true 
            },
            { 
                username: "johnny_b",
                user_id: "user2",
                followers_count: 200,
                following_count: 75,
                isFollowing: false 
            }
        ]);
    });
    
    it("should return 500 if there is a server error", async () => {
        User.find.mockReturnValueOnce({
            limit: jest.fn().mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error("Database error")),
            })
        });
    
        const response = await request(app)
            .post("/user-search")
            .send({ username: "john", viewer_id: "viewer123" });
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Internal server error",
            error: "Database error"
        });
    });
});
