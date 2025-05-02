import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Context } from '../main';
import { toast } from "react-toastify";
import axios from 'axios';
import { backend_api } from '../config';

const DashboardSidebar = () => {
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post(`${backend_api}/api/users/logout`, {
        withCredentials: true,
      });
      toast.success("Logout successful");
      setIsAuthenticated(false);
      setUser([]);
       // Clear cookies manually if needed, though withCredentials should handle httponly cookies
       document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
       // Even if backend fails, force frontend logout for consistency
       setIsAuthenticated(false);
       setUser([]);
       document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ) },
    { name: 'Classroom', path: '/classroom', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zm-4 4a2 2 0 11-4 0 2 2 0 014 0zm-2-2a2 2 0 11-4 0 2 2 0 014 0zm0 0V8m0 0v8" />
      </svg>
    ) },
    { name: 'Assignments', path: '/assignments', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ) },
    { name: 'Resources', path: '/resources', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ) },
    { name: 'Profile', path: '/profile', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ) },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md h-full flex flex-col">
      <div className="py-4 px-6">
        {/* Optional: Add a small logo or title here */}
         {user && (
             <div className="mb-6 text-teal-800 dark:text-mint-cream text-lg font-semibold">
                 Hello, {user.username || 'User'} 👋
             </div>
         )}
      </div>
      <nav className="flex-grow">
        <ul>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`flex items-center py-2 px-6 text-gray-700 dark:text-gray-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-gray-700 dark:hover:text-teal-400 transition duration-150 ${location.pathname === link.path ? 'bg-teal-100 text-teal-800 dark:bg-gray-700 dark:text-teal-400 font-semibold' : ''}`}
              >
                {link.icon}
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* Logout Button */}
      {isAuthenticated && (
        <div className="py-4 px-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-2 px-4 text-left text-gray-700 dark:text-gray-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-gray-700 dark:hover:text-teal-400 transition duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
