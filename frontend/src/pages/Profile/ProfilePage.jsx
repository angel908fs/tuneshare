import { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { CiLink } from "react-icons/ci";
import { FaSpotify } from "react-icons/fa";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userIdFromCookie, setUserIdFromCookie] = useState("");
  const [showFollowAlert, setShowFollowAlert] = useState(false);

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { userId } = useParams(); // get userId from URL parameters
  
     // handle Follow Action
	const handleFollow = async (targetUserId) => {
   try {
     const res = await axios.post('/api/follow', {
     userID: userIdFromCookie,
     target_userID: targetUserId,
     });
 
     if (res.data.success) {
      console.log(`Successfully followed user: ${targetUserId}`);
      toast.success("successfully followed user");
      setShowFollowAlert(true); // show alert
      setTimeout(() => setShowFollowAlert(false), 5000); // hide after 3 seconds
      setUserData((prevUserData)=> ({
        ...prevUserData,
        isFollowing: true,
        followers_count: prevUserData.followers_count + 1,
     }));

     } else if (res.data.error) {
        toast.error("could not follow user");
        console.error("Failed to follow user:", res.data.message);
     }
   } catch (error) {
    if (error.response) {
      // handle 409 specifically
      if (error.response.status === 409) {
        toast.success("user is already being followed");
        console.log("User is already following this user.");
        console.log("Error message:", error.response.data.message);
      } else {
        // handle other response errors
        console.error("Error response:", error.response.data.message);
      }
    } else {
      // handle network errors or other unexpected issues
      console.error("Error while following user:", error.message);
    }
  }
  };
  const handleUnfollow = async (targetUserId) =>{
    try {
      const res = await axios.post('/api/unfollow', {
      userID: userIdFromCookie,
      target_userID: targetUserId,
      });
      if (res.data.success) {
        console.log(`Successfully Unfollowed user: ${targetUserId}`);
        toast.success("successfully Unfollowed user");
        setShowFollowAlert(true); // show alert
        setTimeout(() => setShowFollowAlert(false), 5000); // hide after 3 seconds
        setUserData((prevUserData)=> ({
          ...prevUserData,
          isFollowing: false,
          followers_count: prevUserData.followers_count - 1,
       }));
      } else {
        toast.error("could not unfollow user");
        console.error("Failed to unfollow user:", res.data.message);
     }
  } catch(error){
      console.error("Error while unfollowing user");
      toast.error("Error occurred while unfollowing user");
  }
  };
  useEffect(() => {
    // get user ID from JWT token in cookie
    let currentUserId = "";
    const cookieValue = Cookies.get("tuneshare_cookie");
    if (cookieValue) {
      const decodedToken = jwtDecode(cookieValue);
      const currentUserId = decodedToken.user_id;
      setUserIdFromCookie(currentUserId);
    } else{
      console.log("No token found in the cookie.");
    }
  }, []);

  useEffect(() => {
    if (!userIdFromCookie) return;

    // get profile data
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post("/api/profile", {
          user_id: userId,
          viewer_id: userIdFromCookie,
          page: 1,
        });

        if (response.data.success) {
          setUserData(response.data.data.user);
          setPosts(response.data.data.posts);
          setError(null);
          setIsMyProfile(userIdFromCookie === response.data.data.user?.user_id);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Profile fetch error:",err.response?.data || err.message || err);
        setError("An error occurred while fetching profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId,userIdFromCookie]);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload =async () => {
      setProfileImg(reader.result);

      try{
        const response = await axios.put ("/api/profile/update", {
          user_id: userIdFromCookie,
          profile_picture: reader.result,
        });

        if (response.data.success) {
          toast.success("Profile picture updated!");
          setUserData((prev) => ({ ...prev, profile_picture: reader.result }));

        } else {
          toast.error("Failed to update profile picture.");
        }
      } catch (error) {
        console.error ("Error updating profile picture:", error);
        toast.error("Error updating profile picture.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        {/* HEADER */}
        {isLoading && <ProfileHeaderSkeleton />}
        {error && <p className="text-center text-lg mt-4">{error}</p>}
        {!isLoading && !userData && (
          <p className="text-center text-lg mt-4">User not found</p>
        )}
        <div className="flex flex-col">
          {!isLoading && userData && (
            <>
              <div className="flex gap-10 px-4 py-2 items-center">
                <Link to="/">
                  <FaArrowLeft className="w-8 h-8" />
                </Link>
              </div>
              {/* COVER IMG */}
              <div className="flex justify-center">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={profileImgRef}
                  onChange={handleProfilePicChange}
                />
                {/* USER AVATAR */}
                <div className="avatar"> {/* Avatar positioning  */}
                  <div className="w-32 rounded-full relative group/avatar">
                    <img
                      src={
                        profileImg ||
                        userData?.profile_picture ||
                        "/avatar-placeholder.png"
                      }
                      alt="Profile"
                    />
                    {/*This is the edit pfp button */}
                    <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                      {isMyProfile && (
                        <MdEdit
                          className="w-4 h-4 text-white"
                          onClick={() => profileImgRef.current && profileImgRef.current.click()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Edit profile button */}
              <div className="flex justify-center px-4 mt-5">
                {isMyProfile && <EditProfileModal userData = {userData} setUserData={setUserData}/>}
                {!isMyProfile && (
                  <button
                    className="btn btn-outline rounded-full btn-sm"
                    onClick={async (e) => {
											e.preventDefault();
                      if(userData?.isFollowing){
                        await handleUnfollow(userId);
                      } else {
											await handleFollow(userId);			
                    }
                  }} 
                  >
                    {userData?.isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
                {(coverImg || profileImg) && isMyProfile && (
                  <button
                    className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
										onClick={(e) => {
											e.preventDefault();	
										  }}                  >
                    Update
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-1 px-4">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg">
                    {userData?.fullName || "User"}
                  </span>
                  <span className="text-sm text-slate-500">
                    @{userData?.username}
                  </span>
                  <span className="text-sm my-1">
                    {userData?.bio}
                  </span>
                </div>

                <div className="flex justify-between items-center w-full px-4">
                  <div className="flex gap-2 ">
                    {/*Date joined */}
                    <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">
                      Joined{" "}
                      {new Date(userData?.createdAt).toLocaleDateString()}
                    </span>
                    {/*Link in profile */}
                    {userData?.link && (
                      <a
                      href = {userData.link}
                      target="_blank"
                      rel = "noopener noreferrer"
                      className = "text-sm text-primary underline"
                      >
                        <CiLink className="inline w-4 h-4" />
                        {userData.link}
                      </a>
                    )}
                    <FaSpotify className = "flex w-6 h-6 text-slate-500"/>
                  </div>
                </div>
                {/* Following and Followers # */}
                <div className="flex gap-2 justify-center">
                  <div className="flex gap-1">
                    <span className="font-bold text-xs">
                      {userData?.following_count}
                    </span>
                    <span className="text-slate-500 text-xs">Following</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-xs">
                      {userData?.followers_count}
                    </span>
                    <span className="text-slate-500 text-xs">Followers</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full border-b border-gray-700 mt-4">
                <div
                  className={`flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer ${
                    feedType === "posts" ? "" : "text-slate-500"
                  }`}
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </>
          )}

          <Posts context="profile" profileUserId={userId} />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;