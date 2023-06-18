import React, { useState } from 'react';
import PasswordInput from './PasswordInput';
import { ChakraProvider, Stack, Center, Box } from "@chakra-ui/react";
import LogInComp from "./LogInComp";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import RegistrationDialog from './RegistrationDialog';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useContext } from 'react';
import { AuthContext } from '../../../../AuthContext';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function LogInPage() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPass] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openAlert, setOpenAlert] = useState(false);
  const [nameToWelcome, setNameToWelcome] = useState('');
 

  const { setIsAuthenticated } = useContext(AuthContext);

  const handleCloseAlert2 = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccess(false);
  };
  const handleOpenAlert = () => {
    setOpenAlert(true);
  };
  const handleCloseDialog = (nameRegist) => {
    setNameToWelcome(nameRegist);
    setSuccess(true);
    handleOpenAlert();
  };
  

  const doLogin = (e) => {
    const url = "http://localhost:5000/login"
    const data = {
      login: login,
      password_hashed: password
    }
    axios.post(url, data,{ withCredentials: true})
      .then((res) => {
        setSuccess(true);
        setOpenAlert(true);
        setIsAuthenticated(true);
        navigate('/');
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Invalid login or password");
      });
  }

  return (
    <ChakraProvider>
      <Center h='300px' color='black'>
        <Stack spacing={3}>
          <LogInComp login={login} onChange={setLogin} />
          <PasswordInput password={password} setPass={setPass} />
          <Center>
            <Box as='button' borderRadius='md' bg='tomato' color='white' onClick={doLogin} px={2} h={6} w={20}>
              Sign in
            </Box>
            <Center>
              <Box color="red">{errorMessage}</Box>
            </Center>
          </Center>
          <Center>
            <Link
              className="forgot-link"
              to=""
              sx={{
                color: 'blue',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot password or Login
            </Link>
          </Center>
          <Center>
            <RegistrationDialog onClose={handleCloseDialog} />
            {/*<Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert2}>
            <Alert severity="success">
                <AlertTitle>Success</AlertTitle>
                Welcome! <strong>{nameToWelcome}</strong>
            </Alert>
        </Snackbar>
        */}
        
          </Center>
        </Stack>
      </Center>
      
    </ChakraProvider>
  );
}

export default LogInPage;
