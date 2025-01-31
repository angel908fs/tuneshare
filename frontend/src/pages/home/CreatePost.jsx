import { BsEmojiSmileFill, BsTrophy } from "react-icons/bs";
import { FaMusic } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

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

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [songLink, setSongLink] = useState("");
  const [userID, setUserID] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchBar, setShowSearchBar] = useState(false);



  // retrieve user ID from JWT token in cookie
  useEffect(() => {
    const cookieValue = Cookies.get('tuneshare_cookie');
    if (cookieValue) {
      const decodedToken = jwtDecode(cookieValue);
      setUserID(decodedToken.user_id);
      console.log('User ID from cookie:', decodedToken.user_id);
    } else {
      console.log('No token found in the cookie.');
    }
  }, []);
  
  const fetchSpotifyTracks = async (query) => {
    if (!query) return;
    try {
      const response = await axios.get('/api/spotify-search?q=${query}');
      setSearchResults(response.data.tracks);
    } catch (error){
      {/* will change error here later */}
      console.error("error fetching spotify data:",error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    fetchSpotifyTracks(e.targe.value);
  };

  const selectSong = (track) => {
    setSongLink(track.url);
    setSearchQuery(track.name);
    setShowSearchBar(false); {/*Hide search bar after selection */}
  };

  // mutation to handle post creation
  const { mutate: createPost, isError, isLoading, error } = useMutation({
    mutationFn: async ({ userID, songLink, content }) => {
      try {
        const res = await axios.post('/api/create-post', {
          user_id: userID,
          song_link: songLink,
          content: content,
        }, {
          withCredentials: true,
        });
        return res.data;
      } catch (error) {
        console.error('Error during post creation:', error.response || error.message);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Post created successfully!');
      // reset form fields
      setSongLink('');
      setText('');
      onPostCreated(); // callback to notify for post updates
    },
    onError: (error) => {
      toast.error('Error creating post: ' + (error.response?.data?.message || error.message));
    },
  });

  // handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userID) {
      toast.error('User not logged in');
      return;
    }
    if (!songLink) {
      toast.error('Please enter a song link');
      return;
    }
    if (!text) {
      toast.error('Please enter some content');
      return;
    }
    createPost({ userID, songLink, content: text });
  };

  return (
    <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
      <div className='avatar'>
        <div className='w-8 rounded-full'>
          <img src={"/avatars/boy1.png"} alt="Profile" />
        </div>
      </div>
      <form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
        <textarea
          className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800'
          placeholder='What is happening?!'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {/* music icon with collasbile search */}
        <div className="relative">
          <FaMusic
          className="fill-primary w-5 h-5 cursor-pointer"
          onClick={() => setShowSearchBar(!showSearchBar)}
          />
          {showSearchBar && (
            <div className="absolute top-8 left-0 bg-gray-800 p-2 w-64 rounded-lg shadow-lg">
              <input
                type = "text"
                className="w-full p-2 text-sm bg-gray-900 text-white rounded"
                placeholder="Search for a song..."
                value = {searchQuery}
                onChange={handleSearchChange}
                />
              {searchResults.length > 0 && (
                <ul className="mt-2 max-h-40 overflow-y-auto">
                  {searchResults.map ((track,index) => (
                    <li
                      key = {index}
                      className="p-2 hover:bg-gray-700 curose-pointer"
                      onClick={() => selectSong(track)}
                      >
                        {track.name} - {track.artist}
                      </li>
                  ))}
                </ul>
              )}
              </div>
          )}
        </div>
        <input
          type='text'
          className='input w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800'
          placeholder='Enter song link'
          value={songLink}
          onChange={(e) => setSongLink(e.target.value)}
        />
        {/*creating search bar maybe here? 
        <FaMusic className="fill-primary w-5 h-5 cursor-pointer " />*/}
        <div className='flex justify-between border-t py-2 border-t-gray-700'>
          <div className='flex gap-1 items-center'>
            <BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
          </div>
          <button
            type='submit'
            className='btn btn-primary rounded-full btn-sm text-gray px-4'>
            {isLoading ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && (
          <div className='text-red-500'>
            Something went wrong: {error?.response?.data?.message || error.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
