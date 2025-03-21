import { useState, useEffect } from "react";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const Posts = ({ context, profileUserId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);

        const fetchPosts = async () => {
            try {
                setIsLoading(true); // Show loading indicator
                // Retrieve the JWT from the cookie
                const token = Cookies.get("tuneshare_cookie");
                
                if (!token) {
                    console.error("No token found in cookie");
                    return;
                }

                // Decode the JWT to extract user_id
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.user_id;

                if (!userId) {
                    console.error("User ID not found in token");
                    return;
                }
                
                // Determine the user ID for the request
                const targetUserId = context === "profile" ? profileUserId : userId;

                // Fetch posts from the feed API
                const response = await axios.post("/api/load-feed", {
                    context: context,
                    userid: targetUserId,
                    page: 1,
                });

                if (response.data.success) {
                    setPosts(response.data.data);
                } else {
                    console.error("Failed to fetch posts:", response.data.message);
                }

                const liked_posts = await axios.post("/api/user-liked-posts", {
                    userID: userId
                });
                setLikedPosts(liked_posts.data);

            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setIsLoading(false);
            }
        };

        useEffect(() => {
            fetchPosts(); // Call fetchPosts when component mounts
        }, []);

    return (
        <>
            {isLoading && (
                <div className='flex flex-col justify-center'>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}
            {!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
            {!isLoading && posts && (
                <div>
                    {posts.map((post) => (
                        <Post key={post._id} post={post} likedPosts={likedPosts} fetchPosts={fetchPosts} />
                    ))}
                </div>
            )}
        </>
    );
};

export default Posts;
