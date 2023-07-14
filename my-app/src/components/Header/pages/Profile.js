import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../../LeftColumnComp/MediaCard';


function Profile() {
  const [posts, setPosts] = useState([]);
  const [resp, setResp] = useState(null);
  const navigate = useNavigate();
  
  const BlogsList = () => {
    const listItems = posts.map((item) => (
      <div key={item.id} onClick={() => navigate(`/post/${item.id}`)}>
        <MediaCard
          key={item.id}
          id={item.id}
          isOwner={item.isOwner}
          posted_by={item.posted_by}
          title={item.title}
          text={item.body}
          time={item.created_at}
          commentsCount={item.comments_count}
          image={
            item.image ||
            'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
          }
        />
      </div>
    ));
    return <div>{listItems}</div>;
  };

  const getAllPosts = () => {
    const url = '/server_posts';
    axios
      .get(url, {withCredentials: true})
      .then((res) => {
        setPosts(res.data);
        console.log(res.data);
        setResp(null);
      })
      .catch((err) => {
        setPosts(null);
        setResp('Error: something went wrong, to get all posts.');
      });
  };

  useEffect(() => {
    getAllPosts();
  }, []);

  return (
    <div className="column">  
      <BlogsList  />
    </div>
  );
}

export default Profile;