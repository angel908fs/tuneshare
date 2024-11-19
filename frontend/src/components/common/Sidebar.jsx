import XSvg from "../svgs/Logo";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
	const navigate = useNavigate();
	const [userData, setUserData] = useState(null);
	const [posts, setPosts] = useState([]);
	const [isMyProfile, setIsMyProfile] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [userIdFromCookie, setUserIdFromCookie] = useState("");
	const [userId, setUserId] = useState(null);

	useEffect(() => {
		// get user ID from JWT token in cookie
		const cookieValue = Cookies.get("tuneshare_cookie");
		if (cookieValue) {
			const decodedToken = jwtDecode(cookieValue);
			setUserId(decodedToken.user_id);
			setUserIdFromCookie(decodedToken.user_id); 
			console.log("User ID from cookie:", decodedToken.user_id);
		} else {
			console.log("No token found in the cookie.");
		}
	}, []);
	
	useEffect(() => {
		const fetchProfileData = async () => {
			if (!userId) return;
			try {
				setIsLoading(true);
				const response = await axios.post("/api/profile", {
					user_id: userId,
					page: 1,
				});
				console.log(response.data);
	
				if (response.data.success) {
					console.log(response.data.data);
					setUserData(response.data.data.user);
					setPosts(response.data.data.posts);
					setError(null);
					setIsMyProfile(userId === response.data.data.user.user_id);
				} else {
					setError(response.data.message);
				}
			} catch (err) {
				console.error(err);
				setError("An error occurred while fetching profile data.");
			} finally {
				setIsLoading(false);
			}
		};
	
		fetchProfileData();

		console.log(userData);
	}, [userId]); 
	

	const { mutate:logout} = useMutation({
		mutationFn: async() => {
			try{
				const res = await axios.post('/api/logout',{}, { withCredentials: true });
				return res.data;

			}catch (error){
				throw new Error(error.response?.data?.error || 'Something went wrong');
			}
		},
		onSuccess: () => {
			Cookies.remove("tuneshare_cookie");
			console.log("Cookie has been deleted");
			toast.success('Logout Successful');
			console.log("Navigating to /login");
			navigate("/login");
		},
		onError: () => {
			toast.error('logout failed');
		},
	});
	const data = { // this is hardcoded, will remove later
		fullName: "John Doe",
		username: "johndoe",
		profileImg: "/avatars/boy1.png",
	};

	return (
		<div className='md:flex-[2_2_0] w-18 max-w-52'>
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
				<Link to='/' className='flex justify-center md:justify-start'>
					<XSvg className='px-2 w-6 h-12 rounded-full fill-white hover:bg-stone-900' />
				</Link>
				<ul className='flex flex-col gap-3 mt-4'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<MdHomeFilled className='w-8 h-8' />
							<span className='text-lg hidden md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotifications className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${userId}`}
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaUser className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Profile</span>
						</Link>
					</li>
				</ul>
				{data && userData && (
					<Link
						to={`/profile/${userId}`}
						className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={data?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between flex-1'>
							<div className='hidden md:block'>
								{/* <p className='text-white font-bold text-sm w-20 truncate'>{data?.fullName}</p> */}
								<p className='text-slate-500 text-sm'>@{userData.username}</p>
							</div>
							<RiLogoutCircleLine className='w-5 h-5 cursor-pointer' 
							onClick={(e) => {
								e.preventDefault();
								logout();
							}}
							/>
						</div>
					</Link>
				)}
			</div>
		</div>
	);
};
export default Sidebar;