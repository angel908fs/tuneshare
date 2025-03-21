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
    const [accessToken, setAccessToken] = useState("")

    const getSpotifyAccessToken = async () => {
        const client_id = import.meta.env.VITE_CLIENT_ID;
        const client_secret = import.meta.env.VITE_CLIENT_SECRET;
        const response = await axios.post(
          "https://accounts.spotify.com/api/token",
          new URLSearchParams({ grant_type: "client_credentials" }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${btoa(`${client_id}:${client_secret}`)}`,
            },
          }
        );
        return response.data.access_token;
      };
    
      // 1. Fetch Spotify token once on mount
      useEffect(() => {
        const fetchAccessToken = async () => {
          try {
            const token = await getSpotifyAccessToken();
            setAccessToken(token);
          } catch (err) {
            console.error("Error fetching Spotify token:", err);
          }
        };
        fetchAccessToken();
      }, []);
    

    useEffect(() => {
        const fetchPosts = async () => {
            try {
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

        fetchPosts();
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
                        <Post key={post._id} post={post} likedPosts={likedPosts} accessToken={accessToken}/>
                    ))}
                </div>
            )}
        </>
    );
};

export default Posts;
