import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea'
import Divider from '@mui/material/Divider';
//import defaultImage from 'https://images.unsplash.com/photo-1487088678257-3a541e6e3922?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80';


class MediaCard extends React.Component{
    
   constructor(props){
        super(props)
        this.state={
            id: this.id,
            title: this.props.title,
            text: this.props.text,
            time: this.props.time,
            image: this.props.image,
            posted: this.posted
        }
   } 
   componentDidUpdate(prevProps) {
    if (this.props.title !== prevProps.title) {
      this.setState({ title: this.props.title });
    }
    if (this.props.text !== prevProps.text) {
      this.setState({ text: this.props.text });
    }
    if (this.props.time !== prevProps.time) {
      this.setState({ time: this.props.time });
    }
  }
 
   render(){
        const {title, text, time, image } = this.state;
        
        return(
            <div>
            <Divider />
            <Card sx={{ maxWidth: 900 }}>
            <CardActionArea>
              <CardMedia
                component="img"
                height="400"
                image={image}
                alt="image descrtiption"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {text}
                </Typography>
                <Typography variant="overline" display="block" gutterBottom>
                    Published in {time}
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button size="small" color="primary">
                Share
              </Button>
            </CardActions>
          </Card>
          <Divider />
          </div>
        );
   }
}
export default MediaCard;