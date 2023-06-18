import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { ThemeProvider } from '@mui/material';
import TextField from '@mui/material/TextField';
import { createTheme } from '@mui/material/styles';
import { Box, Button } from '@chakra-ui/react'
import axios from 'axios';
import LogInComp from './LogInComp';
import PasswordInput from './PasswordInput';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import {  useEffect } from 'react';



const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

const theme = createTheme({
    palette: {
      primary: {
        main: '#3f51b5',
      },
      custom: {
        primaryGrayDark: '#YourColorValueHere',
      },
    },
  });


export default function RegistrationDialog(props) {
  //debugger;
  const [open, setOpen] = React.useState(false);
  const [openAlert1, setOpenAlert1] = React.useState(false);
  
  const [user, setUser] = React.useState(null);

  const [loginRegist, setLoginRegist] = React.useState('');
  const [passRegist1, setPassRegist1] = React.useState(null);
  const [passRegist2, setPassRegist2] = React.useState(null);
  const [nameRegist, setNameRegist] = React.useState('');

  const [errorMessages, setErrorMessages] = React.useState({
    errorMessageLogin: '',
    errorMessagePassMatch: '',
    errorMessageMailExist: '',
    errorMessageName: '',
    errorMessageRegist: '',
  });

  const setErrorMessage = (errorType, errorMessage) => {
    setErrorMessages((prevState) => ({
      ...prevState,
      [errorType]: errorMessage,
    }));
  };

  useEffect(() => {
    console.log("Updated errorMessageMailExist:", errorMessages.errorMessageMailExist);
  }, [errorMessages.errorMessageMailExist]);

  useEffect(() => {
    if (errorMessages.errorMessagePassMatch === '') {
      console.log('Passwords match');
    }
  }, [errorMessages.errorMessagePassMatch]);

  const handleChangeName = (event) => {
    if (event.target.value !== undefined) {
      setNameRegist(event.target.value)
    }
  }
    
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    debugger;
    setLoginRegist('');
    setPassRegist1(null);
    setPassRegist2(null);
    setNameRegist('');
    setErrorMessages({
      errorMessageLogin: '',
      errorMessagePassMatch: '',
      errorMessageMailExist: '',
      errorMessageName: '',
      errorMessageRegist: '',
    });
    setOpen(false);
    props.onClose(nameRegist);
  };
  

  const doRegistration = (e) => {

    //debugger;
    const url = "http://localhost:5000/registration"
    const data = {
      name:nameRegist,  
      login: loginRegist,
      password: passRegist2
    }
    axios.post(url, data)
    .then((res) => {
      this.setState({
        data: [],
        resp: "Welcome!"
      });
    })
    .catch((err) => {
        console.error(err);
        setErrorMessage('errorMessageRegist', 'There was some problem');
      });
  }
 
  const checkIfExist = async (loginUser) => {
    debugger;
    const url = `http://localhost:5000/user/${loginUser}`;
    try {
      const response = await axios.get(url);
      console.log("Received specific user:", response.data);
      setUser(response.data);
      if(loginUser === response.data.login){
        //setErrorMessageMailExist("This mail already exists");
        setErrorMessage('errorMessageMailExist', 'This mail already exists');
        return true;
      }
    } catch (error) {
      console.error("Error fetching specific user:", error);
      setErrorMessage('errorMessageMailExist', '');
      //setErrorMessageMailExist('');
        return false;
    }
  };

  const checkIfTheSamePass = (firtsPass,secondPass) =>{
    debugger;
    if (firtsPass === null || secondPass === null || firtsPass === '' || secondPass === ''){
      setErrorMessage('errorMessagePassMatch', "Invalid Passwords");
      return {sameVal : false, valueEmpt : true};
    }
    //setErrorMessage('errorMessagePassMatch','');
    if(firtsPass === secondPass){
        return {sameVal : true, valueEmpt: false};
    }
    setErrorMessage('errorMessagePassMatch', "Invalid Passwords");
    return {sameVal : false, valueEmpt: false};
  }

  const handleRegistration = async () => {
    debugger;
    if (nameRegist !== '') {
      setErrorMessage('errorMessageName', '');
    } else {
      setErrorMessage('errorMessageName', 'You did not pass your Name.');
      return;
    }
    
    if (loginRegist !== '') {
      setErrorMessage('errorMessageLogin', '');
    } else {
      setErrorMessage('errorMessageLogin', 'You did not pass your Login.');
      return;
    }
    
    setErrorMessage('errorMessagePassMatch', '');//need to ask
    debugger;
    console.log(errorMessages.errorMessagePassMatch);// ?? why it's not emoty

    let result = checkIfTheSamePass(passRegist1, passRegist2);
    if (result.sameVal) {
      debugger;
      
      console.log("Updated errorMessageMailExist:", errorMessages.errorMessageMailExist);
      if (
        errorMessages.errorMessageRegist === '' &&
        errorMessages.errorMessageLogin === '' &&
        !result.valueEmpt &&
        errorMessages.errorMessageName === '' &&
        !(await checkIfExist(loginRegist))
      ) {
        debugger;
        await doRegistration();
        debugger;
        handleClose();
      }
    } else {
      handleClickAlert1();
      //setErrorMessage('errorMessagePassMatch', "Invalid Passwords");
    }
  };

  const handleClickAlert1 = () => {
    setOpenAlert1(true);
  };

  const handleCloseAlert1 = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenAlert1(false);
  };
  
  //debugger;
  return (
    <ThemeProvider theme={theme}>
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Didn't registered, yet?
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Registration
            </Typography>
            <Button
                autoFocus
                color="inherit"
                onClick={handleRegistration}
            >
              Save
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          <ListItem>
            <TextField id="name" label="Your Name" variant="outlined" onChange={handleChangeName}/>
          </ListItem>
          <Divider />
          <ListItem>
            <LogInComp login={loginRegist} onChange={setLoginRegist} />
          </ListItem>
          <Divider />
          <ListItem>
            <PasswordInput password={passRegist1} setPass={setPassRegist1} />
          </ListItem>
          <Divider />
          <ListItem>
            <PasswordInput password={passRegist2} setPass={setPassRegist2} />
          </ListItem>
          <Divider />
          <ListItem>
            <Box color="red">{errorMessages.errorMessageName}</Box>
          </ListItem>
          <ListItem>
            <Box color="red">{errorMessages.errorMessageLogin}</Box>
          </ListItem>
          <ListItem>
            <Box color="red">{errorMessages.errorMessagePassMatch}</Box>
          </ListItem>
          <ListItem>
            <Box color="red">{errorMessages.errorMessageMailExist}</Box>
          </ListItem>
        </List>
        <Snackbar open={openAlert1} autoHideDuration={6000} onClose={handleCloseAlert1}>
            <Alert severity="warning">
                <AlertTitle>Warning</AlertTitle>
                Invalid Password or it didn't match— <strong>check it out!</strong>
            </Alert>
        </Snackbar>
      </Dialog>
    </div>
    </ThemeProvider>
  );
}