import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

// Accept isDarkMode and setIsDarkMode as props
const ThemeSwitch = ({ isDarkMode, setIsDarkMode }) => {

  // Toggle function calls the setter passed via props
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleTheme} // Use the toggle function
      // Add some padding and make it visually distinct
      className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${isDarkMode ? 'text-yellow-300 hover:text-yellow-400 focus:ring-yellow-400' : 'text-gray-700 hover:text-teal-600 focus:ring-teal-600'}`}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Use the isDarkMode prop to decide which icon to show */}
      <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} size="lg" />
       {/* Removed the absolutely positioned div wrapper for simplicity and better alignment */}
    </button>
  );
};

export default ThemeSwitch;
