import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";


const RightPanel = () => {
	const isLoading = false;

	const [userIdFromCookie, setUserIdFromCookie] = useState("");
	const [followedUsers, setFollowedUsers] = useState([]); 
	const [searchTerm, setSearchTerm] = useState(""); 
	const [searchResults, setSearchResults] = useState([]);
	const [loadingSearch, setLoadingSearch] = useState(false); 
  
	useEffect(() => {
  	// get user ID from JWT token in cookie
	  const cookieValue = Cookies.get("tuneshare_cookie");
	  let currentUserId = "";
	  if (cookieValue) {
		  const decodedToken = jwtDecode(cookieValue);
		  currentUserId = decodedToken.user_id;
		  setUserIdFromCookie(currentUserId);
		  //console.log("User ID from cookie:", userIdFromCookie);
	  } else {
	  console.log("No token found in the cookie.");}
  }, []);


    // handle Follow Action
	const handleFollow = async (targetUserId) => {
		 //console.log(`Following user: ${targetUserId}`);
		try {
		  const response = await axios.post('/api/follow', {
			userID: userIdFromCookie,
			target_userID: targetUserId,
		  });
	
		  if (response.data.success) {
			console.log(`Successfully followed user: ${targetUserId}`);
			toast.success("successfully followed user")
			setFollowedUsers((prev) => [...prev, targetUserId]); // update the list of followed users
		  } else {
			toast.success("user is already being followed")
			console.log("Failed to follow user:", response.data.message);
		  }
		} catch (error) {
			if (error.response.status === 409) {
				toast.success("user is already being followed")
			} else {
				toast.error("could not follow user" + error.response.data.message)
				console.error("Error while following user:", error);
			}
			
		}
	  };

	const handleSearch = async (e) => {
		const query = e.target.value;
		setSearchTerm(query);

		if (query.trim().length === 0) {
			setSearchResults([]);
			return;
		}

		setLoadingSearch(true);
		try {
			const response = await axios.post("/api/user-search", { username: query });
			if (response.data.success) {
				setSearchResults(response.data.data);
			} else {
				console.error("Search failed:", response.data.message);
			}
		} catch (error) {
			console.error("Error during search:", error);
		} finally {
			setLoadingSearch(false);
		}
	};


	return (
		<div className="hidden lg:block my-4 mx-2">
			<div className="bg-[#16181C] p-4 rounded-md sticky top-2">
				{/* Search Bar */}
				<input
					type="text"
					placeholder="Search users..."
					value={searchTerm}
					onChange={handleSearch}
					className="w-full p-2 rounded-md bg-[#1e2124] text-white placeholder-gray-500 mb-4"
				/>
	
				<p className="font-bold">Who to follow</p>
				<div className="flex flex-col gap-4">
					{/* Search Results */}
					{loadingSearch ? (
						<RightPanelSkeleton />
					) : searchResults.length === 0 && searchTerm.trim() !== "" ? (
						<p className="text-center text-gray-500 mt-2">
							No users found matching "{searchTerm}"
						</p>
					) : searchResults.length > 0 ? (
						searchResults.map((user) => (
							<Link
								to={`/profile/${user.user_id}`}
								className="flex items-center justify-between gap-4"
								key={user.user_id}
							>
								<div className="flex gap-2 items-center">
									<div className="avatar">
										<div className="w-8 rounded-full">
											<img src={user.profileImg || "/avatar-placeholder.png"} alt={user.username} />
										</div>
									</div>
									<div className="flex flex-col">
										<span className="font-semibold tracking-tight truncate w-28">
											{user.username}
										</span>
										<span className="text-sm text-slate-500">
											Followers: {user.followers_count}
										</span>
									</div>
								</div>
								<div>
									<button
										className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
										onClick={(e) => {
											e.preventDefault();
											handleFollow(user.user_id);
										}}
									>
										Follow
									</button>
								</div>
							</Link>
						))
					) : (
						USERS_FOR_RIGHT_PANEL?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className="flex items-center justify-between gap-4"
								key={user._id}
							>
								<div className="flex gap-2 items-center">
									<div className="avatar">
										<div className="w-8 rounded-full">
											<img src={user.profileImg || "/avatar-placeholder.png"} alt={user.username} />
										</div>
									</div>
									<div className="flex flex-col">
										<span className="font-semibold tracking-tight truncate w-28">
											{user.fullName}
										</span>
										<span className="text-sm text-slate-500">@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
										onClick={(e) => {
											e.preventDefault();
											handleFollow(user._id);
										}}
									>
										Follow
									</button>
								</div>
							</Link>
						))
					)}
				</div>
			</div>
		</div>
	);	
};

export default RightPanel;