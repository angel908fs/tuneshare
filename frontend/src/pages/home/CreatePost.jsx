import { BsEmojiSmileFill } from "react-icons/bs";
import { useState, useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [songLink, setSongLink] = useState("");
  const [userID, setUserID] = useState('');

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
        <input
          type='text'
          className='input w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800'
          placeholder='Enter song link'
          value={songLink}
          onChange={(e) => setSongLink(e.target.value)}
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
