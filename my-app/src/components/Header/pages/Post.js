import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import axios from 'axios';

function Post() {
  const [blog, setBlog] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const url = `http://localhost:5000/post?id=${id}`;
    axios
      .get(url)
      .then((res) => {
        console.log("Received specific post:", res.data);
        setBlog(res.data); 
      })
      .catch((err) => {
        console.error("Error fetching specific post:", err);
      });
  }, [id]);

  if (!blog) {
    return <div>Loading...</div>;
  }

  return (
    <div className="post">
      {blog && blog.image && (
        <Box
          sx={{
            backgroundImage: `url(${blog.image? blog.image:'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1>{blog.title}</h1>
        </Box>
      )}

      <p className="post-content">{blog.body}</p>
      <p></p>
      <p>Posted {blog.created_at}</p>
    </div>
  );
}

export default Post;