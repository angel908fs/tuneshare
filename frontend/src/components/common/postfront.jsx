import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PostFrontend = ({ fetchPosts, handleEdit, handleDelete }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
      setLoading(false);
    };
    loadPosts();
  }, [fetchPosts]);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  return (
    <div className="post-container">
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="post-card">
            <h2 className="post-title">{post.title}</h2>
            <p className="post-content">{post.content}</p>
            <div className="post-actions">
              <button onClick={() => handleEdit(post.id)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(post.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
};

PostFrontend.propTypes = {
  fetchPosts: PropTypes.func.isRequired, // function to fetch posts
  handleEdit: PropTypes.func.isRequired, // function to handle post editing
  handleDelete: PropTypes.func.isRequired, // function to handle post deletion
};

export default PostFrontend;
