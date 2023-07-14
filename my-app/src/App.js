import React from 'react';
import { Routes, Route } from "react-router-dom";
import './App.css';
import AboutMe from './components/Header/pages/AboutMe';
import Home from './components/Header/pages/Home';
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import NewPost from './components/Header/pages/NewPost';
import Post from './components/Header/pages/PostComp/Post';
import LogInPage from './components/Header/pages/LogInAndPassPage/LogInPage';
import ResponsiveAppBar from "./components/Header/ResponsiveAppBar";
import { Box } from "@mui/system";
import ContactForm from "./components/Header/pages/ContactForm";
import { AuthProvider } from './AuthContext'
import Profile from './components/Header/pages/Profile'


function App() {
  return (
    <AuthProvider>
      <Box sx={{
        bgcolor: '#fffff2'
      }}>
        <BrowserRouter>  
          <div className = "App">
            <ResponsiveAppBar />  
          </div>
          <div className="route">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutMe />} />
                <Route path='/newPost' element={<NewPost />} />
                <Route path='/post/:id' element={<Post/>} />
                <Route path="/login" element={<LogInPage />} />
                <Route path="/contact" element={<ContactForm />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
          </div> 
        </BrowserRouter>
      </Box>
    </AuthProvider>
  );
}
export default App;
