import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../main';

const Navbar = () => {
  const { isAuthenticated } = useContext(Context);

  return (
    <nav className="bg-mint-cream shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-teal-700">
          V!dyana
        </Link>

        {/* Navigation Links & Controls (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400">Home</Link>
          <Link to="/features" className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400">Features</Link>
          <Link to="/contact" className="text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400">Contact Us</Link>

          <div className="flex items-center space-x-4">
            {/* Auth Buttons */}
            {!isAuthenticated && ( // Only show login/register if not authenticated
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center space-x-3">
           {!isAuthenticated && (
               <>
                 <Link to="/login" className="px-3 py-1 text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 dark:text-teal-400 dark:border-teal-400 dark:hover:bg-gray-700 dark:hover:text-teal-300">Login</Link>
                 <Link to="/register" className="ml-2 px-3 py-1 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800">Register</Link>
               </>
           )}
           {/* Add mobile menu burger icon/logic here if needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
