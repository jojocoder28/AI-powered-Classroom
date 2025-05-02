import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../main';
import { toast } from "react-toastify";
import axios from 'axios';
import { backend_api } from '../config';

const Navbar = () => {
  const navigateTo = useNavigate();
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${backend_api}/api/users/details`, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          });
          setUser(response.data.user);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user details:", error);
          // Optionally handle error, maybe log out user if token is invalid
           setIsAuthenticated(false);
           setUser([]);
           localStorage.removeItem('token'); // Assuming token is stored as 'token'
           toast.error(error.response?.data?.message || "Could not fetch user details.");
           navigateTo("/login");
        }
      } else {
        // If not authenticated, clear user state and stop loading
        setUser([]);
        setLoading(false);
      }
    };

    // Fetch details only if authenticated or if state is not yet loaded
    if (isAuthenticated || loading) {
       fetchUserDetails();
    }

  }, []); // Rerun effect when isAuthenticated changes

  const handleLogout = async () => {
    try {
      await axios.post(`${backend_api}/api/users/logout`, {
        withCredentials: true,
      });
      toast.success("Logout successful");
      setIsAuthenticated(false);
      setUser([]);
      localStorage.removeItem('token');
      navigateTo("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
       // Even if backend fails, force frontend logout for consistency
       setIsAuthenticated(false);
       setUser([]);
       localStorage.removeItem('token');
       navigateTo("/login");
    }
  };

  return (
    <nav className="bg-mint-cream shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-teal-700">
          V!dyana {/* Using text logo for now */}
        </Link>

        {/* Navigation Links & Controls (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-teal-600">Home</Link>
          <Link to="/features" className="text-gray-300 hover:text-teal-600">Features</Link> {/* Assuming a /features route */}
          <Link to="/contact" className="text-gray-300 hover:text-teal-600">Contact Us</Link> {/* Assuming a /contact route */}

          <div className="flex items-center space-x-4">
            {/* Auth Buttons or User Info */}
            {isAuthenticated && user?.email ? ( // Check isAuthenticated and if user object exists and has name
              <div className="flex items-center space-x-4">
                {/* <span className="text-gray-300"></span> */}
          <Link to="/profile" className="text-gray-300 hover:text-teal-600">{user.username}</Link> {/* Assuming a /contact route */}

                 <button
                    onClick={handleLogout}
                    className="cursor-pointer px-4 py-2 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50"
                  >
                   Logout
                 </button>
             </div>
            ) : (
              !isAuthenticated && ( // Only show login/register if not authenticated
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700"
                >
                  Register
                </Link>
              </>
              )
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center space-x-3">
           {isAuthenticated && user?.name ? (
               <button
                    onClick={handleLogout}
                    className="cursor-pointer px-3 py-1 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50"
                  >
                   Logout
                 </button>
           ) : (
              !isAuthenticated && (
               <>
                 <Link to="/login" className="px-3 py-1 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50">Login</Link>
                 <Link to="/register" className="ml-2 px-3 py-1 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700">Register</Link>
               </>
              )
           )}
           {/* Add mobile menu burger icon/logic here if needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;