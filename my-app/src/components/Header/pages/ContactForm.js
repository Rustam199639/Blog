import { useState } from "react";
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/joy/Stack';

const FORM_ENDPOINT = ""; // TODO - fill on the later step

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = () => {
    setTimeout(() => {
      setSubmitted(true);
    }, 100);
  };

  if (submitted) {
    return (
      <div>
        <div className="text-2xl">Thank you!</div>
        <div className="text-md">We'll be in touch soon.</div>
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        
      }}
    >
    <Stack spacing={2}>
        <div className="mb-3 pt-0">
      <TextField
        sx={{
                width:400
            }}
        id="outlined-multiline-flexible"
        label="Your name"
        multiline
        maxRows={4}
        />
      </div>
      <div className="mb-3 pt-0">
        <TextField
            sx={{
                width:400
            }}
          id="outlined-multiline-flexible"
          label="Your eMail"
          multiline
          maxRows={4}
        />
      </div>
      <div className="mb-3 pt-0">
        <TextField
            sx={{
                width:400
            }}
          id="outlined-multiline-static"
          label="Multiline"
          multiline
          rows={4}
          defaultValue="Default Value"
        />
      </div>
      <div className="mb-3 pt-0">
      <Button variant="contained" endIcon={<SendIcon />}>
        Send
      </Button>
      </div>
    </Stack>
    </Box> 
  );
};

export default ContactForm;