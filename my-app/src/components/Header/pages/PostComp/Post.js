import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import axios from 'axios';
import AlignCommentsList from './AlignCommentsList';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';

function Post() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(null);
  const { id } = useParams();
  const [isSignedIn, setSignedIn] = useState(false);
  const [inputComment, setInputComment] = useState('');

  useEffect(() => {
    const url = `/server_post?id=${id}`;
    axios
      .get(url, { withCredentials: true })
      .then((res) => {
        console.log("Received specific post:", res.data);
        setPost(res.data.post); 
        setComments(res.data.comments);
        setSignedIn(res.data.checkLogged)
      })
      .catch((err) => {
        console.error("Error fetching specific post:", err);
      });
  }, [id]);

  const handleInputChange = (event) => {
    setInputComment(event.target.value);
  };

  const handleAddComment = () => {
    const url = `/server_comments`;
    const data = {
      post_id: id,
      body: inputComment,
      comment_date: moment().format()
    };
    axios
      .post(url, data, { withCredentials: true })
      .then((res) => {
        setInputComment('');
        console.log(res.data);
        // Add the newly created comment to the comments state
        setComments([...comments, res.data.comment]);
        window.location.reload();
        toast.success('Comment added successfully!');
      })
      .catch((error) => {
        toast.error('Failed to add comment');
        console.error(error);
      });
  };


  if (!post) {
    return <div>Loading...</div>;
  }
  return (
    <div className="post">
      {post && post.image && (
        <Box
          sx={{
            backgroundImage: `url(${post.image? post.image:'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1>{post.title}</h1>
        </Box>
      )}

      <p className="post-content">{post.body}</p>
      <p></p>
      <p>Posted {post.created_at}</p>
      <AlignCommentsList comments={comments} setComments={setComments} handleAddComment={handleAddComment}/>
      <div>
        {isSignedIn ? 
        <div> 
          <TextField
            id="outlined-multiline-static"
            label="Add your comment"
            multiline
            rows={4}
            defaultValue=""
            sx={{width:'360px'}}
            value={inputComment} onChange={handleInputChange}
          />
          <Button onClick={handleAddComment}>Add Comment</Button>
         </div> 
          : null
          }
      </div>
    </div>
  );
}

export default Post;