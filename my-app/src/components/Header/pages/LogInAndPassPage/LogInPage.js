import React, { useState, useEffect, useRef } from 'react';
import PasswordInput from './PasswordInput';
import { ChakraProvider, Stack, Center, Box } from "@chakra-ui/react";
import LogInComp from "./LogInComp";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import RegistrationDialog from './RegistrationDialog';
import { useContext } from 'react';
import { AuthContext } from '../../../../AuthContext';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function LogInPage() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPass] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openAlert, setOpenAlert] = useState(false);
  const [nameToWelcome, setNameToWelcome] = useState("");
  const [isSuccess, setSuccess] = useState(false);
  const { setIsAuthenticated } = useContext(AuthContext);
  const isInitialRender = useRef(true);


  const showToastMessage = (isSuccess) => {
    if(isSuccess){
      toast.success('Success Notification!', {
        position: toast.POSITION.BOTTOM_LEFT
      });
    }else{
      toast.error('Something went wrong...', {
        position: toast.POSITION.BOTTOM_LEFT
      });
    }
    
  };

  
  const handleOpenAlert = () => {
    setOpenAlert(true);
  };
  const handleCloseDialog = (nameRegist, isSuccessToMelcome) => {
    setNameToWelcome(nameRegist);
    handleOpenAlert();
    showToastMessage(isSuccessToMelcome);
  };
  
  const doLogin = (e) => {
    const url = "/server_login"
    const data = {
      login: login,
      password_hashed: password
    }
    axios.post(url, data,{ withCredentials: true})
      .then((res) => {
        setOpenAlert(true);
        setIsAuthenticated(true);
        navigate('/');
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Invalid login or password");
      });
  }
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    } else {
      // Call showToastMessage here
      showToastMessage(isSuccess);
    }
  }, [isSuccess]);
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
            <RegistrationDialog onClose={handleCloseDialog} setSuccess={setSuccess}/> 
            <ToastContainer />       
          </Center>
        </Stack>
      </Center>
    </ChakraProvider>
  );
}

export default LogInPage;
