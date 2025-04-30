import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitch from './ThemeSwitch'; // Assuming ThemeSwitch remains
import { useAuth } from '../main'; // Assuming you have an AuthContext

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const { user, logout } = useAuth(); // Get user state and logout function
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout(); // Call the logout function from context
    navigate('/'); // Redirect to home or login page after logout
  };

  return (
    <nav className="bg-mint-cream dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-teal-700 dark:text-mint-cream">
          V!dyana {/* Using text logo for now */}
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">Home</Link>
          <Link to="/features" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">Features</Link> {/* Assuming a /features route */}
          <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">Contact Us</Link> {/* Assuming a /contact route */}

          {/* Auth Buttons or User Info */}
          {user ? (
            <div className="relative">
               <button onClick={() => {/* Add dropdown logic */}} className="text-gray-700 dark:text-gray-300 focus:outline-none">
                 Welcome, {user.name}! {/* Display user's name */}
               </button>
               {/* Dropdown Menu (Example) */}
               {/* <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20 dark:bg-gray-800">
                 <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Profile</Link>
                 <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Dashboard</Link>
                 <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Logout</button>
               </div> */}
                 <button
                    onClick={handleLogout}
                    className="ml-4 px-4 py-2 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-gray-800"
                  >
                   Logout
                 </button>
             </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-gray-800"
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
          )}
           {/* Theme Switch - kept if needed */}
           {/* <ThemeSwitch isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> */}
        </div>

        {/* Mobile Menu Button (Optional) */}
        <div className="md:hidden flex items-center">
           {/* Add mobile menu logic here if needed */}
           {/* <ThemeSwitch isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> */}
           {user ? (
               <button
                    onClick={handleLogout}
                    className="ml-4 px-3 py-1 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-gray-800"
                  >
                   Logout
                 </button>
           ) : (
               <>
                 <Link to="/login" className="px-3 py-1 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-gray-800">Login</Link>
                 <Link to="/register" className="ml-2 px-3 py-1 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700">Register</Link>
               </>
           )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
