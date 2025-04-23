import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
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
	const [suggestedUsers, setSuggestedUsers] = useState([]);
  
	// Function to fetch suggested users
	const fetchSuggestedUsers = async () => {
		if (!userIdFromCookie || userIdFromCookie.trim() === "") {
			console.warn("Skipping fetchSuggestedUsers: No valid userIdFromCookie");
			console.log("Suggested users data", response.data.users);
			return;
		}
	
		console.log(`Making API request to: /api/suggested-users with userID: ${userIdFromCookie}`);
	
		try {
			const response = await axios.post("/api/suggested-users", { user_id: userIdFromCookie });
	
			console.log("Suggested Users Response:", response.data); // Debugging Response Data
	
			if (response.data.success) {
				setSuggestedUsers(response.data.users);
			} else {
				console.warn("No suggested users found.");
			}
		} catch (error) {
			console.error("Error fetching suggested users:", error.response?.data || error);
		}
	};
	

	// Fetch user ID from JWT cookie
	useEffect(() => {
		const cookieValue = Cookies.get("tuneshare_cookie");
		if (cookieValue) {
			const decodedToken = jwtDecode(cookieValue);
			setUserIdFromCookie(decodedToken.user_id);
		} else {
			console.log("No token found in the cookie.");
		}
	}, []);

	// Fetch suggested users AFTER userIdFromCookie is set
	useEffect(() => {
		if (userIdFromCookie) {
			console.log("Fetching Suggested Users for User ID:", userIdFromCookie); // Debugging
			fetchSuggestedUsers();
		}
	}, [userIdFromCookie]);

	// Handle Follow Action (Now Refreshes Suggested Users)
	const handleFollow = async (targetUserId) => {
		try {
			const response = await axios.post('/api/follow', {
				userID: userIdFromCookie,
				target_userID: targetUserId,
			});
	
			if (response.data.success) {
				toast.success("Successfully followed user");
				setSuggestedUsers(prev =>
				  prev.map(user =>
					user.user_id === targetUserId ? { ...user, isFollowing: true } : user
				  )
				);
				setSearchResults(prev =>
					prev.map(user=>
							user.user_id === targetUserId ? {...user, isFollowing: true } : user
					)
				);
			  }
		} catch (error) {
			if (error.response?.status === 409) {
				toast.success("User is already being followed");
			} else {
				toast.error("Could not follow user");
				console.error("Error while following user:", error);
			}
		}
	};
	const handleUnfollow = async (targetUserId) => {
		try {
			const res = await axios.post('/api/unfollow', {
				userID: userIdFromCookie,
				target_userID: targetUserId,
			});

			if (res.data.success) {
				toast.success("Successfully unfollowed user");
				setSuggestedUsers(prev =>
					prev.map(user =>
						user.user_id === targetUserId ? {...user, isFollowing: false} : user
					)
				);
				setSearchResults(prev =>
					prev.map(user =>
						user.user_id === targetUserId ? {...user, isFollowing: false}: user
					)
				);
			}
		}catch (error) {
			toast.error("Error occurred while unfollowing user");
			console.log("Unfollow error:", error);
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
			const response = await axios.post("/api/user-search", { 
				username: query,
				viewer_id: userIdFromCookie,
			 });
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
		<div className="hidden lg:block my-4 mx-2 min-w-[300px] max-w-[300px]">
			<div className="bg-[#16181C] p-4 rounded-md sticky top-2">
				{/* Search Bar */}
				<input
					type="text"
					placeholder="Search users..."
					value={searchTerm}
					onChange={handleSearch}
					className="w-full p-2 rounded-md bg-[#1e2124] text-white placeholder-gray-500 mb-4"
				/>
				{/* Show Search Results if SearchTerm Exists */}
				{searchTerm.trim() ? (
					<>
						<p className="font-bold">Search Results</p>
						<div className="flex flex-col gap-4">
							{loadingSearch ? (
								<RightPanelSkeleton />
							) : searchResults.length === 0 ? (
								<p className="text-center text-gray-500 mt-2">
									No users found matching "{searchTerm}"
								</p>
							) : (
								searchResults.map((user) => (
									<div className="flex items-center justify-between gap-4" key = {user.user_id}>
										<Link to={`/profile/${user.user_id}`} className="flex gap-2 items-center">
											<div className="avatar">
												<div className="w-8 rounded-full">
													<img src={user.profile_picture || "/avatar-placeholder.png"} alt={user.username} />
												</div>
											</div>
											<div className="flex flex-col">
												<span className="font-semibold tracking-tight truncate w-28">{user.username}</span>
												<span className="text-sm text-slate-500">Followers: {user.followers_count}</span>
											</div>
										</Link>
										<button className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm" 
											onClick={async(e) => { 
											e.preventDefault();
											if (user.isFollowing) {
												await handleUnfollow(user.user_id);
											} else{
												await handleFollow(user.user_id); 
											}
											}}
										>
											{user.isFollowing ? "Unfollow" : "Follow"}
										</button>
									</div>
								))
							)}
						</div>
					</>
				) : (
					/* Show Suggested Users if No Search Term */
					<>
						<p className="font-bold">Suggested for you</p>
						<div className="flex flex-col gap-4">
							{suggestedUsers.length === 0 ? (
								<p className="text-center text-gray-500 mt-2">No suggestions available</p>
							) : (
								suggestedUsers.map((user) => (
									<div className="flex items-center justify-between gap-4" key={user.user_id}>
										<Link to={`/profile/${user.user_id}`} className="flex gap-2 items-center">
											<div className="avatar">
												<div className="w-8 rounded-full">
													<img src={user.profile_picture || "/avatar-placeholder.png"} alt={user.username} />
												</div>
											</div>
											<div className="flex flex-col">
												<span className="font-semibold tracking-tight truncate w-28">{user.username}</span>
												<span className="text-sm text-slate-500">Followers: {user.followers_count}</span>
											</div>
										</Link>
										<button className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm" 
											onClick={async (e) => {
												e.preventDefault(); 
												if (user.isFollowing){
													await handleUnfollow(user.user_id);
												} else{
													await handleFollow(user.user_id);
												}
												}}>
											{user.isFollowing ? "Unfollow" : "Follow"}
										</button>
									</div>
								))
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default RightPanel;