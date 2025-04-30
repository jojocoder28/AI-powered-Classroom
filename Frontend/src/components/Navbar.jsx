import ThemeSwitch from "./ThemeSwitch.jsx";
import NavbarElements from "../elements/NavbarElements.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main"; // Import Context
import React, { useContext, useState, useEffect } from "react"; // Keep useContext
import { Link, useNavigate } from "react-router-dom";
import { backend_api } from "../config.js"; // Use backend_api from config

export default function Navbar(props) {
  const [navbarOpen, setNavbarOpen] = useState(false);
  
  // Use useContext to get state and functions from Context
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
  
  const navigateTo = useNavigate();

  // Uncomment and potentially adapt this useEffect if needed for fetching user on load
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       // Check if already authenticated before fetching
  //       if (isAuthenticated) {
  //          console.log('User already authenticated:', user);
  //          return;
  //       }
        
  //       // Add logic here to check for a token (e.g., in localStorage)
  //       // If token exists, try to fetch profile to verify and set user state
  //       const token = localStorage.getItem('authToken'); // Example: getting token
  //       if (token) {
  //          console.log("Attempting to fetch user with token...")
  //          // Make sure the /profile endpoint exists and uses the token for auth
  //          const { data } = await axios.get(
  //           `${backend_api}/users/profile`, // Use template literal correctly
  //           {
  //             headers: { Authorization: `Bearer ${token}` }, // Send token
  //             withCredentials: true 
  //           }
  //         );
  //         console.log('Fetched user data:', data.user);
  //         setUser(data.user);
  //         setIsAuthenticated(true);
  //       } else {
  //         console.log("No token found, user is not logged in.")
  //         // Ensure state is reset if no token
  //         setIsAuthenticated(false);
  //         setUser({});
  //       }
        
  //     } catch (error) {
  //       console.error("Error fetching user profile:", error);
  //       // Clear auth state if token is invalid or fetch fails
  //       localStorage.removeItem('authToken'); // Remove invalid token
  //       setIsAuthenticated(false);
  //       setUser({});
  //     }
  //   };
  //   fetchUser();
  // }, [setIsAuthenticated, setUser, isAuthenticated, user]); // Dependencies for useEffect

  const handleLogout = async () => {
    try {
      // Check if backend logout endpoint exists and handles token invalidation/cookie clearing
      await axios.get(`${backend_api}/users/logout`, {
        withCredentials: true, // Important if backend uses cookies
      });
      toast.success("Logout successful");
      setIsAuthenticated(false);
      setUser({});
      // Optionally remove token from localStorage
      localStorage.removeItem('authToken'); 
      navigateTo("/login"); // Redirect to login after logout
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
      // Even if backend fails, force frontend logout
      setIsAuthenticated(false);
      setUser({});
      localStorage.removeItem('authToken'); 
      navigateTo("/login");
    }
  };

  const goToLogin = () => {
    navigateTo("/login");
  };

  return (
    <nav
      className={
        (props.transparent
          ? "top-0 absolute z-50 w-full" // Changed relative to absolute for transparency case
          : "relative bg-white dark:bg-gray-800 shadow-lg") +
        " flex flex-wrap items-center justify-between px-2 py-3" // Removed top-2
      }
    >
      <div className="container lg:px-4 lg:mx-auto flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
          {/* Brand Logo/Name */}
          <Link
            className="text-sm leading-none mr-4 whitespace-nowrap uppercase px-3 py-2 flex items-center font-bold text-gray-800 dark:text-white hover:text-pink-600 dark:hover:text-pink-400"
            to={isAuthenticated ? "/dashboard" : "/"}
          >
            {isAuthenticated && user?.username ? `Welcome, ${user.username}` : "Vidyana"}
          </Link>
          {/* Hamburger Button */}
          <button
            className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none text-gray-800 dark:text-white"
            type="button"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <i className="fas fa-bars">
              <svg
                className={`h-6 w-6 transition-transform duration-300 ${navbarOpen ? 'transform rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={navbarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                />
              </svg>
            </i>
          </button>
        </div>
        {/* Navigation Links */}
        <div
          className={
            "lg:flex flex-grow items-center lg:bg-transparent lg:shadow-none" +
            (navbarOpen ? " block rounded shadow-lg bg-white dark:bg-gray-800" : " hidden")
          }
          id="example-navbar-warning"
        >
           {/* Moved Nav Elements inside collapsible div */}
           <ul className="flex flex-col lg:flex-row list-none lg:mr-auto">
             <NavbarElements name="Home" link="/" flag={navbarOpen}/>
             {isAuthenticated && <NavbarElements name="Dashboard" link="/dashboard" flag={navbarOpen}/>}
             {isAuthenticated && <NavbarElements name="Profile" link="/profile" flag={navbarOpen}/>}
             {/* Conditionally show Login/Register or Logout */}
             {isAuthenticated ? (
                <li className="flex items-center">
                  <button
                  className={" cursor-pointer text-gray-800 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"}
                  onClick={handleLogout}
                >
                  Logout
                </button></li>
             ) : (
                <>
                  <li><NavbarElements name="Register" link="/register" flag={navbarOpen} /></li>
                  <li><NavbarElements name="Login" link="/login" flag={navbarOpen} /></li>
                </>
             )}
          </ul>
          {/* Theme Switch moved to the right */}
          <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
            <li className="flex items-center">
              <ThemeSwitch/>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
