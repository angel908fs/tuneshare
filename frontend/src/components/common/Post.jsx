import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaPlay, FaPause } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode}  from "jwt-decode";

const getSpotifyTrackMetadata = async (spotifyUrl, token) => {
  try {
    const trackId = spotifyUrl.split("/track/")[1].split("?")[0];
    const market = "US";

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


const searchDeezerTrack = async (trackName, artistName) => {
  const query = `${artistName} ${trackName}`.trim();
  console.log("Sending search request for:", query); // Debugging request

  try {
    // Adjust the path below if your backend runs on a different port
    const response = await axios.get(`http://localhost:8080/api/deezer-search`, {
      params: { query },
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

const get30SecPreview = async (spotifyUrl, token) => {
  const spotifyTrack = await getSpotifyTrackMetadata(spotifyUrl, token);
  if (!spotifyTrack) {
    console.error("Could not retrieve track data from Spotify.");
    return null;
  }

  if (spotifyTrack.preview_url) {
    console.log("Using Spotify preview:", spotifyTrack.preview_url);
    return spotifyTrack.preview_url;
  }

  console.log("No Spotify preview found. Searching on Deezer...");
  return await searchDeezerTrack(spotifyTrack.name, spotifyTrack.artists[0].name);
};

const Post = ({ post, likedPosts, accessToken }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]); // for rendering in modal
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState("");
  const [trackMetadata, setTrackMetadata] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(null);
  const [userIdFromCookie, setUserIdFromCookie] = useState("");



  useEffect(() => {
    // 1) If post has a song_link, fetch track metadata
    const fetchMetadata = async () => {
      if (accessToken && post.song_link) {
        const metadata = await getSpotifyTrackMetadata(post.song_link, accessToken);
        setTrackMetadata(metadata);
      }
    };
    fetchMetadata();

    // 2) Set initial likes from post prop
    setLikes(post.likes || 0);

    // 3) Decode userID from JWT cookie
    const cookieValue = Cookies.get("tuneshare_cookie");
    if (cookieValue) {
      try {
        const decodedToken = jwtDecode(cookieValue);
        setUserIdFromCookie(decodedToken.user_id);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    } else {
      console.log("No token found in the cookie.");
    }

    // 4) Check if this post is already liked by the user
    if (likedPosts?.data?.liked_posts?.includes(post.post_id)) {
      setIsLiked(true);
    }
  }, [post.song_link, post.likes, post.post_id, likedPosts, accessToken]);

  const handleDeletePost = () => {
    // Your delete post logic or route call
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    setErrorComments("");
    try {
      const res = await axios.post("/api/get-comments", {
        postID: post.post_id,
      });
      if (res.data.success) {
        // The array is in res.data.data.comments
        setComments(res.data.data.comments);
        console.log(res.data.data.comments);
      } else {
        setErrorComments(res.data.message || "Unknown error fetching comments");
      }
    } catch (error) {
      setErrorComments(error.message);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleOpenCommentsModal = async () => {
    const modalId = "comments_modal" + post.post_id;
    document.getElementById(modalId).showModal();
    await fetchComments();
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const res = await axios.post("/api/post-comment", {
        comment,
        userID: userIdFromCookie,
        postID: post.post_id,
      });
      if (res.data.success) {
        setComment("");
        // Refresh comments
        await fetchComments();
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleDeleteComment = async (commentID) => {
    try {
      const res = await axios.delete("/api/delete-comment", {
        data: {
          commentID,
          userID: userIdFromCookie,
          postID: post.post_id,
        },
      });
      if (res.data.success) {
        // Re-fetch comments
        await fetchComments();
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleLikePost = async () => {
    try {
      let newLikes;
      if (isLiked) {
        const res = await axios.post("/api/unlike", {
          postID: post.post_id,
          userID: userIdFromCookie,
        });
        if (res.status === 200) {
          newLikes = likes - 1;
          setIsLiked(false);
        }
      } else {
        const res = await axios.post("/api/like", {
          postID: post.post_id,
          userID: userIdFromCookie,
        });
        if (res.status === 200) {
          newLikes = likes + 1;
          setIsLiked(true);
        }
      }
      setLikes(newLikes);
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const togglePlayPause = async () => {
    if (!post.song_link) return;

    // Stop any existing audio before playing a new one
    if (audio) {
      audio.pause();
      setIsPlaying(false);
      setAudio(null);
    }

    if (!isPlaying) {
      if (!previewUrl) {
        const preview = await get30SecPreview(post.song_link);
        if (preview) {
          setPreviewUrl(preview);
          const newAudio = new Audio(preview);
          newAudio.play();
          setAudio(newAudio);
          setIsPlaying(true);

          newAudio.onended = () => setIsPlaying(false);
        } else {
          alert("No preview available for this track.");
        }
      } else {
        // If preview URL is already stored, just play it
        const newAudio = new Audio(previewUrl);
        newAudio.play();
        setAudio(newAudio);
        setIsPlaying(true);

        newAudio.onended = () => setIsPlaying(false);
      }
    }
  }
  const postOwner = post || {};

  const isMyPost = true; 
  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link to={`/profile/${postOwner.user_id}`} className="w-8 rounded-full overflow-hidden">
            <img src={postOwner?.profile_picture || "/avatar-placeholder.png"} alt="profile" />

          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.user_id}`} className="font-bold">
              {postOwner.username}
            </Link>
            <span className="text-gray-500 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.user_id}`}>@{postOwner.username}</Link>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                <FaTrash className="cursor-pointer hover:text-red-500" onClick={handleDeletePost} />
              </span>
            )}
          </div>

          {/* POST BODY */}
          <div className="flex flex-col gap-3 overflow-hidden">
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
            <span>{post.content || "<no content specified>"}</span>

            {/* OPTIONAL: SPOTIFY/DEEZER PREVIEW */}
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
                          >
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
                          className="flex flex-col items-center"
                        >
                          <a
                            href={post.song_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-3xl font-bold text-center hover:underline"
                          >
                            {trackMetadata.name}
                          </a>
                          <p className="text-xl text-center mt-2">
                            {trackMetadata.artists.map((artist) => artist.name).join(", ")}
                          </p>
                          <p className="text-sm text-center mt-1">
                            <strong>Album:</strong> {trackMetadata.album.name}
                          </p>
                          <div className="mt-4 flex justify-center w-full">
                            <button
                              style={{
                                color: "rgba(255, 255, 255, 0.6)",
                                textShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
                              }}
                              onClick={togglePlayPause}
                              className="mt-4 text-white rounded-full transition-transform duration-300 transform hover:scale-125 flex items-center justify-center text-4xl mx-auto"
                            >
                              {isPlaying ? <FaPause /> : <FaPlay />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* POST FOOTER */}
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              {/* COMMENT ICON */}
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={handleOpenCommentsModal}
              >
                <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {comments.length}
                </span>
              </div>

              {/* COMMENT MODAL */}
              <dialog id={`comments_modal${post.post_id}`} className="modal border-none outline-none">
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>

                  {loadingComments && <p>Loading comments...</p>}
                  {errorComments && <p className="text-red-500">{errorComments}</p>}

                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {(!loadingComments && comments.length === 0) && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}

                    {comments.map((commentObj) => (
                      <div key={commentObj.comment_id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={commentObj.profile_picture || "/avatar-placeholder.png"}
                              alt="User Avatar"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          {/* 
                            1) Link to the user's profile for the comment author
                            2) Show created_at
                          */}
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/profile/${commentObj.user_id}`}
                              className="font-bold hover:underline"
                            >
                              {commentObj.username}
                            </Link>
                            <span className="text-xs text-gray-400 ml-1">
                              {new Date(commentObj.created_at).toLocaleString()}
                            </span>
                          </div>
                          {/* The actual comment text */}
                          <div className="text-sm mt-1">{commentObj.comment}</div>

                          {/* Delete button if this is my comment */}
                          {commentObj.user_id === userIdFromCookie && (
                            <button
                              className="text-xs text-red-400 hover:text-red-600 underline mt-1"
                              onClick={() => handleDeleteComment(commentObj.comment_id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* POST A NEW COMMENT */}
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
                    <button
                      type="submit"
                      className="btn btn-primary rounded-full btn-sm text-white px-4"
                    >
                      Post
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>

              {/* REPOST */}
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">0</span>
              </div>

              {/* LIKE BUTTON */}
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
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

            {/* BOOKMARK ICON */}
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