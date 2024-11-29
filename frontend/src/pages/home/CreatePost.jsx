import { BsEmojiSmileFill } from "react-icons/bs";
import { useState, useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';


const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState(""); // for content input
  const [songQuery, setSongQuery] = useState(""); // for song search query or link
  const [userID, setUserID] = useState('');

  // Retrieve user ID from JWT token in cookie
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

  // Mutation to handle post creation
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
      // Reset form fields
      setSongQuery('');
      setText('');
      onPostCreated(); // Callback to notify for post updates
    },
    onError: (error) => {
      toast.error('Error creating post: ' + (error.response?.data?.message || error.message));
    },
  });

  // Function to check if input is a valid URL
  const isValidURL = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userID) {
      toast.error('User not logged in');
      return;
    }
    if (!songQuery) {
      toast.error('Please enter a song name or link');
      return;
    }
    if (!text) {
      toast.error('Please enter some content');
      return;
    }

    let songLink = "";

    if (isValidURL(songQuery)) {
      // Use the provided link directly if it's a valid URL
      songLink = songQuery;
    } else {
      try {
        // Fetch Spotify link using the /search route
        const searchRes = await axios.get('/api/search', { params: { q: songQuery } });
        if (searchRes.data && searchRes.data.data) {
          songLink = searchRes.data.data; // Spotify link from search
        } else {
          toast.error('No song found with the provided query.');
          return;
        }
      } catch (error) {
        console.error('Error during song search:', error.response || error.message);
        toast.error('Error searching for the song');
        return;
      }
    }

    // Create the post
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
        <input
          type='text'
          className='input w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800'
          placeholder='Enter song name or link'
          value={songQuery}
          onChange={(e) => setSongQuery(e.target.value)}
        />
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