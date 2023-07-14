import React, { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AlignCommentsList(props) {
  const [open, setOpen] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [comments, setComments] = useState(props.comments || []); // Initialize comments state

  const CommentList = () => {
    if (!comments || comments.length === 0) {
      return null;
    }
  
    const handleEditComment = (commentId) => {
      const comment = comments.find((item) => item.comment_id === commentId);
      handleSaveComment();
      setEditedText(comment.body);
      setSelectedCommentId(commentId);
      setOpen(true);
    };

    const handleDeleteComment = (commentId) => {
      axios
        .delete(`/server_comments?id=${commentId}`)
        .then((response) => {
          window.location.reload();
          toast.success('Comment deleted successfully');
        })
        .catch((error) => {
          toast.error('Failed to delete comment');
          console.error(error);
        });
    };
  
    const listItems = comments.map((item) => (
      <ListItem key={item.comment_id} alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
        </ListItemAvatar>
        <ListItemText
          primary={item.comment_by}
          secondary={
            <React.Fragment>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                {item.body}
              </Typography>
              {item.isOwnerComment && (
                <div>
                  <Button onClick={() => handleEditComment(item.comment_id)}>Edit</Button>
                  <Button onClick={() => handleDeleteComment(item.comment_id)}>Delete</Button>
                </div>
              )}
            </React.Fragment>
          }
        />
      </ListItem>
    ));
  
    return <List>{listItems}</List>;
  };

  const handleSaveComment = () => {
    if (selectedCommentId && editedText.trim() !== '') {
      axios
        .put(`/server_comments?comment_id=${selectedCommentId}`, {
          body: editedText.trim(),
        })
        .then((response) => {
          console.log(response.data);
          // Get the updated comment body from the response
          const updatedCommentBody = response.data.b;
  
          // Find the comment in the local state
          const updatedComments = comments.map((comment) => {
            if (comment.comment_id === selectedCommentId) {
              // Update the body of the comment with the new text
              return {
                ...comment,
                body: updatedCommentBody,
              };
            }
            return comment;
          });
          setComments(updatedComments);
          toast.success('Comment updated successfully');
          handleClose();
        })
        .catch((error) => {
          toast.error('Failed to update comment');
          console.error(error);
        });
    }
  };
  

  const handleTextChange = (event) => {
    setEditedText(event.target.value);
  };

  const handleClose = () => {
    setEditedText('');
    setSelectedCommentId(null);
    setOpen(false);
  };

  return (
    <div>
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        <CommentList />
      </List>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Edit Comment</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
            <TextField
              id="outlined-multiline-static"
              label="Comment Text"
              multiline
              rows={6}
              fullWidth 
              value={editedText}
              onChange={handleTextChange}
              sx={{width: '400px', height: '200px'}}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSaveComment}>Save</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </div>
  );
}
