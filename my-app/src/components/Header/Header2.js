import { Box } from '@mui/material';

function Header2(){
    return (
        <Box
        sx={{
          backgroundImage: 'url("https://images.pexels.com/photos/823841/pexels-photo-823841.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          height: '300px', // set height as per your requirement
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1>Blog for life</h1>
      </Box>
    );
}
export default Header2;