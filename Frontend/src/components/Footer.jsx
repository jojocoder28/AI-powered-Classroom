import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom'; // Import Link

const Footer = () => {
  return (
    <footer className="bg-teal-800 dark:bg-gray-900 text-mint-cream dark:text-gray-300 pt-12 pb-8">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Contact Us Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <i className="fas fa-map-marker-alt mt-1 mr-3 text-teal-400"></i>
              <span>
                Vidyana AI <br />
                707, Mars Road
              </span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-phone-alt mr-3 text-teal-400"></i>
              <span>1244 66 66 8888</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-envelope mr-3 text-teal-400"></i>
              {/* Using mailto link */}
              <a href="mailto:imbatman@gmail.com" className="hover:text-teal-300">imbatman@gmail.com</a>
            </li>
          </ul>
        </div>

        {/* Placeholder for potential middle column (e.g., Quick Links) */}
        <div>
           {/* <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
           <ul className="space-y-2">
             <li><Link to="/about" className="hover:text-teal-300">About Us</Link></li>
             <li><Link to="/faq" className="hover:text-teal-300">FAQ</Link></li>
             <li><Link to="/terms" className="hover:text-teal-300">Terms of Service</Link></li>
             <li><Link to="/privacy" className="hover:text-teal-300">Privacy Policy</Link></li>
           </ul> */}
        </div>

        {/* Be Social Section */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-4">Be Social</h3>
          <div className="flex justify-center md:justify-start space-x-4">
            <a href="#" target="_blank" rel="noopener noreferrer" className="bg-teal-700 dark:bg-gray-700 hover:bg-teal-600 dark:hover:bg-gray-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-300">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="bg-teal-700 dark:bg-gray-700 hover:bg-teal-600 dark:hover:bg-gray-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-300">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="bg-teal-700 dark:bg-gray-700 hover:bg-teal-600 dark:hover:bg-gray-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-300">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="bg-teal-700 dark:bg-gray-700 hover:bg-teal-600 dark:hover:bg-gray-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-300">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

      </div>
      {/* Copyright is handled by CopyrightElement in App.jsx */}
    </footer>
  );
};

export default Footer;
