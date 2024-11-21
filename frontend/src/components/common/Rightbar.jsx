import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

const RightPanel = () => {
	const isLoading = false;

	const [userIdFromCookie, setUserIdFromCookie] = useState("");
	const [followedUsers, setFollowedUsers] = useState([]); // Track followed users

  
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


    // Handle Follow Action
	const handleFollow = async (targetUserId) => {
		 //console.log(`Following user: ${targetUserId}`);
		try {
		  const response = await axios.post('/api/follow', {
			userID: userIdFromCookie,
			target_userID: targetUserId,
		  });
	
		  if (response.data.success) {
			console.log(`Successfully followed user: ${targetUserId}`);
			setFollowedUsers((prev) => [...prev, targetUserId]); // Update the list of followed users
		  } else {
			console.error("Failed to follow user:", response.data.message);
		  }
		} catch (error) {
		  console.error("Error while following user:", error);
		}
	  };


	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
                        
					{!isLoading &&
						USERS_FOR_RIGHT_PANEL?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => {
											e.preventDefault();
											handleFollow(user._id);			
										  }}
									>
										Follow
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;