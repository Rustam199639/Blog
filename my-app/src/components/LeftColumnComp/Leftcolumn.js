import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MediaCard from './MediaCard';


function Leftcolumn() {
  const [data, setData] = useState([]);
  const [resp, setResp] = useState(null);
  const navigate = useNavigate();
  
  const BlogsList = () => {
    const listItems = data.map((item) => (
      <div key={item.id} onClick={() => navigate(`/post/${item.id}`)}>
        <MediaCard
          key={item.id}
          id={item.id}
          title={item.title}
          text={item.body}
          time={item.created_at}
          image={
            item.image ||
            'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
          }
        />
      </div>
    ));
    return <>{listItems}</>;
  };

  const getAllPosts = () => {
    const url = 'http://localhost:5000/posts';
    axios
      .get(url)
      .then((res) => {
        setData(res.data);
        setResp(null);
      })
      .catch((err) => {
        setData(null);
        setResp('Error: something went wrong, to get all cities.');
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

export default Leftcolumn;