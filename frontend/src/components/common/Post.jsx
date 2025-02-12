import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// get access token
const getSpotifyAccessToken = async () => {
    const client_id = import.meta.env.VITE_CLIENT_ID;
    const client_secret = import.meta.env.VITE_CLIENT_SECRET;

    const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
            grant_type: "client_credentials",
        }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${btoa(`${client_id}:${client_secret}`)}`,
            },
        }
    );

    return response.data.access_token;
};

const getSpotifyTrackMetadata = async (spotifyUrl) => {
    try {
        const trackId = spotifyUrl.split("/track/")[1].split("?")[0];
        const token = await getSpotifyAccessToken();
        const market = 'US';

        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                market, 
            },
        });
        
        return response.data;
    } catch (error) {
        console.error("Error fetching track metadata:", error);
    }
};

const getLikeCount = async (postID) => {
    console.log("post id" + postID);
    const res = await axios.post('/api/like-count', {
        postID: postID,
    });
    console.log(res);
    return res.data.likes | 0;
}

const Post = ({ post, likedPosts }) => {
    const [comment, setComment] = useState("");
    const [trackMetadata, setTrackMetadata] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(null);


    const postOwner = post;
    const isMyPost = true;
    const formattedDate = "1h";
    const isCommenting = false;
    const postID = post.post_id;
    const [userIdFromCookie, setUserIdFromCookie] = useState("");

    useEffect(() => {
        const fetchMetadata = async () => {
            if (post.song_link) {
                const metadata = await getSpotifyTrackMetadata(post.song_link);
                setTrackMetadata(metadata);
            }
        };
        fetchMetadata();
        setLikes(post.likes || 0);
    


        // get user ID from JWT token in cookie
        let currentUserId = "";
        const cookieValue = Cookies.get("tuneshare_cookie");
        if (cookieValue) {
          const decodedToken = jwtDecode(cookieValue);
          currentUserId = decodedToken.user_id;
          setUserIdFromCookie(currentUserId);
        } else {
          console.log("No token found in the cookie.");
        }
        console.log(likedPosts);
        if (likedPosts.data.liked_posts.includes(postID)) {
            setIsLiked(true);
        }
    }, [post.song_link]);

    const handleDeletePost = () => {};
    const handlePostComment = (e) => {
        e.preventDefault();
    };
    const handleLikePost = async () => {
        try {
            let newLikes;
            if (isLiked) {
                const res = await axios.post('/api/unlike', { postID: postID, userID: userIdFromCookie});
                if (res.status == 200) newLikes = likes - 1; 
                setIsLiked(false);
            } else {
                const res = await axios.post('/api/like', { postID: postID, userID: userIdFromCookie });
                if (res.status == 200) newLikes = likes + 1; 
                setIsLiked(true);
            }
    
            setLikes(newLikes);
            console.log(`Updated likes count: ${newLikes}`);
        } catch (error) {
            console.error("Error updating likes:", error);
        }
    
    };

    return (
        <>
            <div className="flex gap-2 items-start p-4 border-b border-gray-700">
                <div className="avatar">
                    <Link to={`/profile/${postOwner.user_id}`} className="w-8 rounded-full overflow-hidden">
                        <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
                    </Link>
                </div>
                <div className="flex flex-col flex-1">
                    <div className="flex gap-2 items-center">
                        <Link to={`/profile/${postOwner.user_id}`} className="font-bold">
                            {postOwner.username}
                        </Link>
                        <span className="text-gray-700 flex gap-1 text-sm">
                            <Link to={`/profile/${postOwner.user_id}`}>@{postOwner.username}</Link>
                            <span>·</span>
                            <span>{formattedDate}</span>
                        </span>
                        {isMyPost && (
                            <span className="flex justify-end flex-1">
                                <FaTrash className="cursor-pointer hover:text-red-500" onClick={handleDeletePost} />
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 overflow-hidden">
                        {post.img && (
                            <img
                                src={post.img}
                                className="h-80 object-contain rounded-lg border border-gray-700"
                                alt=""
                            />
                        )}
                        <span>{post.content || "<no content specified>"}</span>
                        {post.song_link && (
                            <div className="spotify-metadata mt-3 p-12 border border-gray-700 rounded relative overflow-hidden">
                            {trackMetadata && (
                                <>
                                    {trackMetadata.album.images[0] && (
                                        <div
                                            className="absolute inset-0 -z-10 bg-cover bg-center"
                                            style={{
                                                backgroundImage: `url(${trackMetadata.album.images[0].url})`,
                                                filter: "blur(20px) brightness(0.5)",
                                            }}
                                        ></div>
                                    )}
                        
                                    <div className="flex gap-4 items-center relative">
                                        <div className="w-1/2 flex justify-center items-center">
                                            {trackMetadata.album.images[0] && (
                                                <a
                                                    href={post.song_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                > {/* Album Cover */}
                                                    <img
                                                        src={trackMetadata.album.images[0].url} 
                                                        alt="Song Cover"
                                                        className="w-50 h-50 rounded-lg object-cover transition-transform duration-300 transform hover:scale-110"
                                                    />
                                                </a>
                                            )}
                                        </div>
                        
                                        <div className="w-1/2 flex flex-col justify-center">
                                            <div
                                                style={{
                                                    color: "rgba(255, 255, 255, 0.6)", 
                                                    textShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)", 
                                                }}
                                            >
                                                {/* Song Name */}
                                                <a
                                                    href={post.song_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-3xl font-bold hover:underline"
                                                >
                                                    {trackMetadata.name}
                                                </a>
                                                {/* Artist */}
                                                <p className="text-lg mt-2">
                                                    {trackMetadata.artists
                                                        .map((artist) => artist.name)
                                                        .join(", ")}
                                                </p>
                                                {/* Album */}
                                                <p className="text-sm mt-1">
                                                    <strong>Album:</strong> {trackMetadata.album.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        
                                   
                        )}
                    </div>
                    <div className="flex justify-between mt-3">
                        <div className="flex gap-4 items-center w-2/3 justify-between">
                            <div
                                className="flex gap-1 items-center cursor-pointer group"
                                onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
                            >
                                <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                                    {post.comments.length}
                                </span>
                            </div>
                            <dialog id={`comments_modal${post._id}`} className="modal border-none outline-none">
                                <div className="modal-box rounded border border-gray-600">
                                    <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                                    <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                                        {post.comments.length === 0 && (
                                            <p className="text-sm text-slate-500">
                                                No comments yet 🤔 Be the first one 😉
                                            </p>
                                        )}
                                        {post.comments.map((comment) => (
                                            <div key={comment._id} className="flex gap-2 items-start">
                                                <div className="avatar">
                                                    <div className="w-8 rounded-full">
                                                        <img
                                                            src={comment.user.profileImg || "/avatar-placeholder.png"}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold">{comment.user.fullName}</span>
                                                        <span className="text-gray-700 text-sm">
                                                            @{comment.user.username}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm">{comment.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form
                                        className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                                        onSubmit={handlePostComment}
                                    >
                                        <textarea
                                            className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
                                            placeholder="Add a comment..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                                            {isCommenting ? (
                                                <span className="loading loading-spinner loading-md"></span>
                                            ) : (
                                                "Post"
                                            )}
                                        </button>
                                    </form>
                                </div>
                                <form method="dialog" className="modal-backdrop">
                                    <button className="outline-none">close</button>
                                </form>
                            </dialog>
                            <div className="flex gap-1 items-center group cursor-pointer">
                                <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
                                <span className="text-sm text-slate-500 group-hover:text-green-500">0</span>
                            </div>
                            <div className="flex gap-1 items-center group cursor-pointer" onClick={handleLikePost}>
                                {!isLiked && (
                                    <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                                )}
                                {isLiked && <FaHeart className="w-4 h-4 cursor-pointer text-pink-500" />}

                                <span
                                    className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                                        isLiked ? "text-pink-500" : ""
                                    }`}
                                >
                                    {likes}
                                </span>
                            </div>
                        </div>
                        <div className="flex w-1/3 justify-end gap-2 items-center">
                            <FaRegBookmark className="w-4 h-4 cursor-pointer text-slate-500 hover:text-yellow-500" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Post;
