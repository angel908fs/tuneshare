import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaPlay, FaPause } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode}  from "jwt-decode";
import toast from "react-hot-toast";


const Post = ({ post, likedPosts, accessToken, fetchPosts }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]); // for rendering in modal
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState("");
  const [trackMetadata, setTrackMetadata] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [postUser, setPostUser] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(null);
  const [userIdFromCookie, setUserIdFromCookie] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1); // start at 1.0 = 100%


  const onlyUseSpotifyApi = false;

  const getSpotifyTrackMetadata = async (spotifyUrl, token) => {
    try {
      if (onlyUseSpotifyApi) {
        console.log("🔄 [Metadata] Using Spotify API directly (bypassing DB)");
        const trackId = spotifyUrl.split("/track/")[1].split("?")[0];
        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { market: "US" },
        });
        return response.data;
      }

      const response = await axios.post("/api/song-metadata", {
        spotifyUrl,
        spotifyToken: token,
      });

      if (response.data.success) {
        const source = response.data.from;
        if (source === "db") {
          console.log("✅ [Metadata] Fetched from database (already cached)" + " " + response.data.data.song_name);
        } else if (source === "spotify") {
          console.log("✅ [Metadata] Fetched from Spotify API (and saved to DB)" + " " + response.data.data.song_name);
        }

        const song = response.data.data;

        return {
          name: song.song_name,
          artists: song.artist_names.map((name) => ({ name })),
          album: {
              name: song.album_name,
              images: [{ url: song.album_image_url }],
          },
          preview_url: song.deezer_preview_url || song.preview_url || null,
          preview_source: song.deezer_preview_url
              ? "deezer"
              : song.preview_url
              ? "spotify"
              : "none",
        };
      }

      return null;
    } catch (error) {
      console.error("❌ [Metadata] Failed to fetch:", error.message);
      return null;
    }
  };
  useEffect(() => {
    const fetchEverything = async () => {
      if (!accessToken) return;
  
      // only fetch metadata if we haven't fetched it yet
      if (!trackMetadata && post.song_link) {
        try {
          const metadata = await getSpotifyTrackMetadata(post.song_link, accessToken);
          setTrackMetadata(metadata);
        } catch (err) {
          console.error("Error fetching track metadata:", err);
        }
      }
  
      // set likes once
      setLikes(post.likes || 0);
  
      // always fetch comments
      fetchComments();
  
      // decode userId once
      if (!userIdFromCookie) {
        const cookieValue = Cookies.get("tuneshare_cookie");
        if (cookieValue) {
          try {
            const decodedToken = jwtDecode(cookieValue);
            setUserIdFromCookie(decodedToken.user_id);
          } catch (err) {
            console.error("Error decoding token:", err);
          }
        } else {
          console.warn("No token found in cookie.");
        }
      }
  
      // only fetch post owner info if not already fetched
      if (!postUser && post.user_id) {
        try {
          const res = await axios.get(`/api/userInfo/${post.user_id}`);
          console.log("✅ Fetched post owner user data");
          if (res.data) {
            setPostUser(res.data);
          }
        } catch (err) {
          console.error("❌ Error fetching post owner user data:", err);
        }
      }
    };
  
    fetchEverything();
  }, [accessToken, post.song_link, post.user_id]);
  
  

  const handleDeletePost = async (postID) => {
    try {
      const res = await axios.delete(`/api/delete-post?userID=${userIdFromCookie}&postID=${postID}`);
      if (res.data.success) {
        toast.success("Post deleted successfully!");
        fetchPosts();  // 🚀 refresh the post list dynamically
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error.response?.data || error.message);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    setErrorComments("");
    try {
      const res = await axios.post("/api/get-comments", {
        postID: post.post_id,
      });
      if (res.data.success) {
        // the array is in res.data.data.comments
        setComments(res.data.data.comments);
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
        // refresh comments
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
        // refetch comments
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
    if (!post.song_link || !accessToken) return;
    if (loadingPreview) return;
  
    // stop any existing audio before playing a new one
    if (audio) {
      audio.pause();
      setIsPlaying(false);
      setAudio(null);
    }
  
    if (!isPlaying) {
      if (!previewUrl) {
        try {
          setLoadingPreview(true);  // 🔥 start loading
          const metadata = await getSpotifyTrackMetadata(post.song_link, accessToken);
          const preview = metadata?.preview_url;
  
          if (preview) {
            setPreviewUrl(preview);
            setTrackMetadata(metadata);
  
            const newAudio = new Audio(preview);
            newAudio.play();
            setAudio(newAudio);
            setIsPlaying(true);
  
            console.log(`🎧 Playing "${metadata.name}" from ${metadata.preview_source} preview`);
  
            newAudio.onended = () => setIsPlaying(false);
          } else {
            console.error(`❌ No preview available for ${metadata.name}`);
          }
        } finally {
          setLoadingPreview(false);  // 🔥 stop loading no matter what
        }
      } else {
        const newAudio = new Audio(previewUrl);
        newAudio.play();
        setAudio(newAudio);
        setIsPlaying(true);
  
        console.log(`🎧 Playing "${trackMetadata?.name}" from cached preview URL`);
  
        newAudio.onended = () => setIsPlaying(false);
      }
    }
  };
  

  
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
          <Link to={`/profile/${postOwner.user_id}`} className="font-bold flex items-center gap-1">
            {postOwner.fullName}
            {postUser?.verified && ( //this is responsible for looking at the users info and seeing if verified
              <FaCheckCircle title="Verified" className="text-blue-400 text-sm" />
            )}

          </Link>
            <span className="text-gray-500 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.user_id}`}>@{postOwner.username}</Link>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
               <FaTrash className="cursor-pointer hover:text-red-500" onClick={() => handleDeletePost(post.post_id)} />
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

            {post.song_link && (
              <div className="spotify-metadata mr-10 p-12 border border-gray-700 rounded-lg overflow-hidden relative">
                {trackMetadata && (
                  <>
                    {trackMetadata.album.images[0] && (
                      <div
                      className="absolute inset-0 -z-10 bg-cover bg-center transition-all duration-500"
                      style={{
                        backgroundImage: `url(${trackMetadata.album.images[0].url})`,
                        filter: `blur(20px) brightness(${isPlaying ? "0.3" : "0.5"})`,
                      }}
                    ></div>
                    
                    )}

                    <div className="flex gap-8 items-center relative">
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
                            className={`w-50 h-50 rounded-lg object-cover transition-all duration-500 transform ${
                              isPlaying ? "scale-110 shadow-[0_0_20px_5px_rgba(255,255,255,0.25)]" : "scale-100 shadow-none"
                            } hover:scale-110`}
                          />

                          </a>
                        )}
                      </div>
                      <div className="w-1/2 flex flex-col justify-center">
                      <div
                          style={{
                            color: isPlaying ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.6)",
                            textShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
                            transition: "color 0.5s ease",
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
                              {loadingPreview ? (
                                <div className="text-4xl flex items-center justify-center">
                                  <div className="w-9 h-9 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
                                </div>
                              ) : (
                                isPlaying ? <FaPause /> : <FaPlay />
                              )}
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
                            1) link to the user's profile for the comment author
                            2) show created_at
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
                          {/* the actual comment text */}
                          <div className="text-sm mt-1">{commentObj.comment}</div>

                          {/* delete button if this is my comment */}
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