import { BsEmojiSmileFill, BsTrophy } from "react-icons/bs";
import { FaMusic } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
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
  const [spotifyToken, setSpotifyToken] = useState("");
  const searchBarRef = useRef(null); // create ref for the search bar
  const [songCover, setSongCover] = useState("");




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

  useEffect(() => {
    const fetchToken = async() => {
      const token = await getSpotifyAccessToken();
      setSpotifyToken(token);
    };
    fetchToken();
  }, [setSpotifyToken]);
  
  useEffect(() => {
    function handleClickOutside(event){
      if(searchBarRef.current && !searchBarRef.current.contains(event.target)){
        setShowSearchBar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSpotifyTracks = async (query) => {
    if (!query || !spotifyToken) return;
    try {
      const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      }
    );
    setSearchResults (response.data.tracks.items);
    } catch (error){
      // will change later
      console.error("Error fetching Spotify data:",error);
    }
    
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSpotifyTracks(query);
  };

  const selectSong = (track) => {
    setSongLink(track.external_urls.spotify);
    setSearchQuery(`${track.name} - ${track.artists.map(artist => artist.name).join(", ")}`);
    setSongCover(track.album.images[0]?.url);
    setShowSearchBar(false); 
  }

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
          className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none'
          placeholder='What is happening?!'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
          {/* search bar */}
          <div className="relative w-full max-w-sm" ref={searchBarRef}>
          <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
            {songCover && (
              <img
                src={songCover}
                alt="Album Cover"
                className="w-8 h-8 rounded-sm"
              />
            )}
            <FaMusic className="text-blue-400 w-5 h-5 cursor-pointer" />
            <input
              type="text"
              className="w-full bg-transparent text-lg border-none focus:outline-none placeholder-gray-400"
              placeholder="Search for Song..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchSpotifyTracks(e.target.value);
                setShowSearchBar(true);
              }}
            />
          </div>

          {/* song dropdown */}
          {showSearchBar && searchResults.length > 0 && (
            <div className="z-50 absolute top-12 left-0 w-full bg-gray-900 p-2 rounded-lg shadow-lg border border-gray-700">
              <ul className="max-h-60 overflow-y-auto">
                {searchResults.map ((track) => (
                  <li
                    key = {track.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      selectSong(track);
                      setShowSearchBar(false);
                    }}
                  >
                    {/*Album Cover */}
                    <img 
                      src = {track.album.images[0]?.url} 
                      alt = {track.name} 
                      className="w-12 h-12 rounded-sm"
                    />
                    {/* Song Details */}
                    <div>
                      <p className="text-white font-medium">{track.name}</p>
                      <p className="text-gray-400 text-sm">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className='flex justify-between border-t py-2 border-t-gray-700'>
          <div className='flex-wrap gap-1 items-center'>
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
