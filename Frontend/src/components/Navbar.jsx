import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitch from './ThemeSwitch'; // Import ThemeSwitch
import { useAuth } from '../main'; // Assuming you have an AuthContext

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Otherwise, check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
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

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only change if localStorage isn't set (i.e., user hasn't manually toggled)
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);


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

        {/* Navigation Links & Controls (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">Home</Link>
          <Link to="/features" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">Features</Link> {/* Assuming a /features route */}
          <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">Contact Us</Link> {/* Assuming a /contact route */}

          <div className="flex items-center space-x-4">
            {/* Auth Buttons or User Info */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300">Welcome, {user.name}!</span>
                 <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-gray-800"
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
                  className="px-4 py-2 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
                >
                  Register
                </Link>
              </>
            )}
            {/* Theme Switch */}
            {/* <ThemeSwitch isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> */}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center space-x-3">
           {/* Theme Switch */}
           {/* <ThemeSwitch isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> */}
           {user ? (
               <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-gray-800"
                  >
                   Logout
                 </button>
           ) : (
               <>
                 <Link to="/login" className="px-3 py-1 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-gray-800">Login</Link>
                 <Link to="/register" className="ml-2 px-3 py-1 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600">Register</Link>
               </>
           )}
           {/* Add mobile menu burger icon/logic here if needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
