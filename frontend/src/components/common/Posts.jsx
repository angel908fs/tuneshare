import { useState, useEffect, useRef, useCallback } from "react";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const Posts = ({ context, profileUserId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [accessToken, setAccessToken] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

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

    const fetchPosts = async (currentPage = 1) => {
        const isFirstPage = currentPage === 1;
        try {
            if (isFirstPage) {
                setIsLoading(true);
            } else {
                setLoadingMore(true);
            }

            const token = Cookies.get("tuneshare_cookie");
            if (!token) return;

            const decodedToken = jwtDecode(token);
            const userId = decodedToken.user_id;
            const targetUserId = context === "profile" ? profileUserId : userId;

            const response = await axios.post("/api/load-feed", {
                context,
                userid: targetUserId,
                page: currentPage,
            });

            if (response.data.success) {
                if (isFirstPage) {
                    setPosts(response.data.data);
                } else {
                    setPosts((prev) => [...prev, ...response.data.data]);
                }

                if (response.data.data.length === 0) {
                    setHasMore(false);
                }
            }

            const liked_posts = await axios.post("/api/user-liked-posts", {
                userID: userId,
            });
            setLikedPosts(liked_posts.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            if (isFirstPage) {
                setIsLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };

    // initial and paginated fetch
    useEffect(() => {
        fetchPosts(page);
    }, [page]);

    // reset and refetch when profile changes
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchPosts(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [profileUserId]);

    const lastPostRef = useCallback(
        (node) => {
            if (isLoading || loadingMore) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [isLoading, loadingMore, hasMore]
    );

    return (
        <>
            {isLoading && page === 1 && (
                <div className="flex flex-col justify-center">
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}
            {!isLoading && posts?.length === 0 && (
                <p className="text-center my-4">No posts in this tab. Switch 👻</p>
            )}
            <div>
                {posts.map((post, index) => {
                    if (posts.length === index + 1) {
                        return (
                            <div ref={lastPostRef} key={post._id}>
                                <Post
                                    post={post}
                                    likedPosts={likedPosts}
                                    accessToken={accessToken}
                                    fetchPosts={() => fetchPosts(1)}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <Post
                                key={post._id}
                                post={post}
                                likedPosts={likedPosts}
                                accessToken={accessToken}
                                fetchPosts={() => fetchPosts(1)}
                            />
                        );
                    }
                })}

                {loadingMore && (
                    <div className="flex justify-center py-4">
                        <span className="loading loading-spinner loading-md text-primary"></span>
                    </div>
                )}
            </div>
        </>
    );
};

export default Posts;
