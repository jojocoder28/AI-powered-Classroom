import React, { createContext, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import './index.css';
import axios from 'axios'; // Import axios
import { backend_api } from './config'; // Import backend_api

export const Context = createContext({
  isAuthenticated: false,
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const checkAuth = async () => {
      

     
        try {
          // Verify token with backend and fetch user details
          const response = await axios.get(`${backend_api}/api/users/details`, { // Assuming you have a /me endpoint
            
            withCredentials: true, // If your backend uses cookies for session management alongside token
          });

          if (response.data.success) {
            setIsAuthenticated(true);
            setUser(response.data.user);
          } else {
            // Token invalid or user not found, clear cookie
            // document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            setIsAuthenticated(false);
            setUser({});
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          // Handle error (e.g., token expired, invalid)
          // document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          setIsAuthenticated(false);
          setUser({});
        }
     
      setLoading(false); // Set loading to false after check
    };

    checkAuth();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        loading // Provide loading state
      }}
    >
      <App />
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);