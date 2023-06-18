import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/joy/Stack';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const MySnackbarContent = React.forwardRef(function MySnackbarContent(props, ref) {
    return (
      <div ref={ref} {...props}>
        {props.children}
      </div>
    );
  });

function NewPost() {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [isPosted, setPost] = React.useState(false);
  const navigate = useNavigate();

  const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };
  const handleClick = async () => {
    try {
      await addPost();
      debugger

    } catch (error) {
      console.error(error);
    }
  };
  

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const getId = (session_id) => {
    debugger;
    const url = `http://localhost:5000/getId/${session_id}`;
    return axios
      .get(url)
      .then(function (response) {
        const data = response.data;
        console.log(data);
        return data.id;
      })
      .catch(function (error) {
        console.error(error);
        throw error;
      });
  };

  const addPost = async () => {
    debugger;
    return new Promise((resolve, reject) => {
        debugger;
      const sessionId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('session_id='))
        .split('=')[1];
  
      getId(sessionId)
        .then((user_id) => {
            debugger;
          const url = `http://localhost:5000/post?id=${user_id}`;
          const data = {
            owner_id: user_id,
            title: title,
            image:
              'https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=696&q=80',
            created_at: moment().format(),
            body: body,
            published: true,
            likes: 0,
          };
  
          axios
            .post(url, data, { withCredentials: true })
            .then(async (res) => {
              setTitle('');
              setBody('');
              setOpen(true);
              setPost(true);
              await sleep(2000);
              navigate('/');
              resolve(); // Resolve the promise
            })
            .catch((err) => {
              console.error(err);
              setOpen(true);
              reject(err); // Reject the promise
            });
        })
        .catch((err) => {
          console.error(err);
          reject(err); // Reject the promise
        });
    });
  };
  
  

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Stack spacing={2}>
          <h1>New Post</h1>
          <TextField
            sx={{
              width: 400,
              '& svg': {
                viewBox: '0 0 100 4',
              },  
            }}
            id="outlined-multiline-flexible"
            label="Title:"
            multiline
            maxRows={4}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            sx={{
              width: 800,
              '& svg': {
                viewBox: '0 0 100 4',
              },
            }}
            id="outlined-multiline-static"
            label="Multiline"
            multiline
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button
            sx={{ bgcolor: '#6cb7c5', color: 'black' }}
            variant="outlined"
            onClick={handleClick}
          >
            Post
          </Button>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                <MySnackbarContent>
                    <div>
                        Posted!
                    </div>
                </MySnackbarContent>
            </Alert>
          </Snackbar>
        </Stack>
      </Box>
    </>
  );
}

export default NewPost;
