import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import FiberNewSharpIcon from '@mui/icons-material/FiberNewSharp';
import { useNavigate } from 'react-router-dom';

function PopularBlogs(){

    const navigate = useNavigate();

    const BlogsPostList = (props) => {
        const blogs = props.blogs;
        const listItems = blogs.map((item) =>(
            <ListItem key={item.number} disablePadding divider>
            <ListItemButton onClick ={()=> navigate(`${item.link}`)}>
              <ListItemIcon>
                <FiberNewSharpIcon />
              </ListItemIcon>
              <ListItemText primary={`Blog #${item.number}`} />
            </ListItemButton>
          </ListItem>    
        ));
        return <div>{listItems}</div>;
    };

    const blogs =[
        {number: 1, link:'/post/1'},
        {number: 2, link:'/post/2'},
        {number: 3, link:'/post/3'}
    ];

    return (
        <div className="card" id="popular">
            <h2>Popular</h2>
            <div className="insidelateset">
                <Divider />
                <BlogsPostList blogs={blogs} /> 
            </div>
        </div>
    );
}
export default PopularBlogs;