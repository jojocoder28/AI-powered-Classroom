import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard'; // Assuming Dashboard.jsx exists
import Classroom from './pages/Classroom';
import Settings from './pages/Settings'; // Assuming Settings.jsx exists
import './App.css'; // Assuming you have App.css for basic styling

function App() {
  return (
    <BrowserRouter>
      {/* You can add a Navbar or Header component here, outside the Routes,
          so it appears on all pages */}
      {/* <Navbar /> */}

      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/classroom" element={<Classroom />} />
        <Route path="/settings" element={<Settings />} />


        {/* Add a catch-all route for 404 Not Found pages */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>

      {/* You can add a Footer component here, outside the Routes */}
      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;
