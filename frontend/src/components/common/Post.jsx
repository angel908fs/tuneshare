import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const postOwner = post; // Assign postOwner directly to post for now, as post contains the necessary fields
	const isLiked = false;

	const isMyPost = true;

	const formattedDate = "1h";

	const isCommenting = false;

    const isBookedmarked = false;

	const handleDeletePost = () => {};

	const handlePostComment = (e) => {
		e.preventDefault();
	};

	const handleLikePost = () => {};
	
    return (
        <div className='flex gap-2 items-start p-4 border-b border-gray-700'>
            {/* Avatar */}
            <div className='avatar'>
                {postOwner.username ? (
                    <Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
                        <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt={`${postOwner.username}'s avatar`} />
                    </Link>
                ) : (
                    <div className='w-8 rounded-full overflow-hidden bg-gray-700'>
                        <img src="/avatar-placeholder.png" alt="Placeholder avatar" />
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className='flex flex-col flex-1'>
                <div className='flex gap-2 items-center'>
                    {postOwner.username ? (
                        <Link to={`/profile/${postOwner.username}`} className='font-bold'>
                            {postOwner.fullName || postOwner.username}
                        </Link>
                    ) : (
                        <span className='font-bold text-gray-500'>Unknown User</span>
                    )}
                    <span className='text-gray-700 flex gap-1 text-sm'>
                        {postOwner.username && <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>}
                        <span>·</span>
                        <span>{new Date(post.created_at).toLocaleString() || "Unknown Date"}</span>
                    </span>
                </div>
                <div className='flex flex-col gap-3 overflow-hidden'>
                    <span>{post.content || ""}</span>
                    {post.song_link && (
                        <a href={post.song_link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
							{post.song_link}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Post;
