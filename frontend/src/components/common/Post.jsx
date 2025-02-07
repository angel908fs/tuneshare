import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { FaPlay, FaPause } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Get Spotify Access Token
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

// Get Spotify Track Metadata
const getSpotifyTrackMetadata = async (spotifyUrl) => {
    try {
        const trackId = spotifyUrl.split("/track/")[1].split("?")[0];
        const token = await getSpotifyAccessToken();
        const market = 'US';

        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: { market },
        });

        console.log("Spotify Track Metadata:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching track metadata:", error);
        return null;
    }
};

// Search for the Song on Deezer (Using Backend Proxy)
const searchDeezerTrack = async (trackName, artistName) => {
    const query = `${artistName} ${trackName}`.trim();

    console.log("Sending search request for:", query); // Debugging request

    try {
        const response = await axios.get(`http://localhost:8080/api/deezer-search`, {
            params: { query }
        });

        if (response.data.data.length > 0) {
            const track = response.data.data[0]; // Take the first result
            console.log("Deezer Track Found:", track);
            return track.preview; // 30-sec preview URL
        } else {
            console.warn("No preview available from Deezer.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching track from Deezer:", error.message);
        return null;
    }
};


// Main function: Get 30-Second Preview from Spotify or Deezer
const get30SecPreview = async (spotifyUrl) => {
    const spotifyTrack = await getSpotifyTrackMetadata(spotifyUrl);
    
    if (!spotifyTrack) {
        console.error("Could not retrieve track data from Spotify.");
        return null;
    }

    // Check if Spotify has a preview URL
    if (spotifyTrack.preview_url) {
        console.log("Using Spotify preview:", spotifyTrack.preview_url);
        return spotifyTrack.preview_url;
    }

    // If Spotify has no preview, try Deezer
    console.log("No Spotify preview found. Searching on Deezer...");
    return await searchDeezerTrack(spotifyTrack.name, spotifyTrack.artists[0].name);
};

// Example Usage
const spotifySongUrl = "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp";
get30SecPreview(spotifySongUrl).then(previewUrl => {
    if (previewUrl) {
        console.log("🎵 30-sec Preview URL:", previewUrl);
    } else {
        console.log("No preview available.");
    }
});

const getLikeCount = async (postID) => {
    console.log("post id" + postID);
    const res = await axios.post('/api/like-count', {
        postID: postID,
    });
    console.log(res);
    return res.data.likes | 0;
}


const Post = ({ post }) => {
    const [comment, setComment] = useState("");
    const [trackMetadata, setTrackMetadata] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);  // Track playback state
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(null)


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
    }, [post.song_link]);

    const handleDeletePost = () => {};
    const handlePostComment = (e) => {
        e.preventDefault();
    };
    const handleLikePost = async () => {
        try {
            let newLikes;
            if (isLiked) {
                const res = await axios.post('/api/unlike', { postID: postID });
                if (res.status == 200) newLikes = likes - 1; 
                setIsLiked(false);
            } else {
                const res = await axios.post('/api/like', { postID: postID });
                if (res.status == 200) newLikes = likes + 1; 
                setIsLiked(true);
            }
    
            setLikes(newLikes);
            console.log(`Updated likes count: ${newLikes}`);
        } catch (error) {
            console.error("Error updating likes:", error);
        }
    
    };

    const togglePlayPause = async () => {
        if (!post.song_link) return;
    
        if (!isPlaying) {
            // If not playing, fetch preview URL and play
            const preview = await get30SecPreview(post.song_link);
            if (preview) {
                playWithMPV(preview);
                setIsPlaying(true);
            } else {
                alert("No preview available for this track.");
            }
        } else {
            // If playing, send pause command
            pauseMPV();
            setIsPlaying(false);
        }
    };
    

    // Function to play audio using MPV
    const playWithMPV = (url) => {
        fetch(`http://localhost:8080/api/play?url=${encodeURIComponent(url)}`)
            .then((res) => res.json())
            .then((data) => console.log(data))
            .catch((err) => console.error("Error playing with MPV:", err));
    };

    // Function to pause MPV playback
    const pauseMPV = () => {
        fetch(`http://localhost:8080/api/pause`)
            .then((res) => res.json())
            .then((data) => console.log("Paused MPV:", data))
            .catch((err) => console.error("Error pausing MPV:", err));
    };

    const handlePlayPreview = async () => {
        if (!post.song_link) return;
    
        const preview = await get30SecPreview(post.song_link);
        if (preview) {
            console.log("Preview URL found:", preview);
            playWithMPV(preview); // Call the function here
        } else {
            alert("No preview available for this track.");
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
                     {/* Post Text Content */}
                     <div className="flex flex-col gap-3 overflow-hidden">
                        <span>{post.content || "<no content specified>"}</span>

                        {/* Song Metadata Section */}
                        {post.song_link && (
                            <div className="spotify-metadata mt-3 p-4 border border-gray-700 rounded relative overflow-hidden">
                                {trackMetadata && (
                                    <>
                                        {/* Album Background Blur */}
                                        {trackMetadata.album.images[0] && (
                                            <div
                                                className="absolute inset-0 -z-10 bg-cover bg-center"
                                                style={{
                                                    backgroundImage: `url(${trackMetadata.album.images[0].url})`,
                                                    filter: "blur(20px) brightness(0.5)",
                                                }}
                                            ></div>
                                        )}

                                        {/* Song Details */}
                                        <div className="flex gap-4 items-center relative">
                                            {/* Album Cover */}
                                            <div className="w-1/2 flex justify-center items-center">
                                                {trackMetadata.album.images[0] && (
                                                    <a
                                                        href={post.song_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <img
                                                            src={trackMetadata.album.images[0].url}
                                                            alt="Song Cover"
                                                            className="w-50 h-50 rounded-lg object-cover transition-transform duration-300 transform hover:scale-110"
                                                        />
                                                    </a>
                                                )}
                                            </div>

                                            {/* Song Information */}
                                            <div className="w-1/2 flex flex-col justify-center">
                                                <a
                                                    href={post.song_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-2xl font-bold hover:underline"
                                                >
                                                    {trackMetadata.name}
                                                </a>
                                                <p className="text-lg mt-2">
                                                    {trackMetadata.artists
                                                        .map((artist) => artist.name)
                                                        .join(", ")}
                                                </p>
                                                <p className="text-sm mt-1">
                                                    <strong>Album:</strong> {trackMetadata.album.name}
                                                </p>

                                                {/* Play Button */}
                                                <button
                                                    onClick={togglePlayPause}
                                                    className="mt-3 px-4 py-2 bg-cover text-white rounded-md hover:bg-grey-700 flex items-center gap-2"
                                                >
                                                    {isPlaying ? <FaPause /> : <FaPlay />} 
                                                    {isPlaying ? "Pause" : "Play Preview"}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isLiked && <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500" />}
                                <span
                                    className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                                        isLiked ? "text-pink-500" : ""
                                    }`}
                                >
                                    {likes}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Post;
