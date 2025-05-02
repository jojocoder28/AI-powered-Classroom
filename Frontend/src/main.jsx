import React, { createContext, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import './index.css';
import axios from 'axios';
import { backend_api } from './config';

export const Context = createContext({
  isAuthenticated: false,
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const cookies = document.cookie.split(';');
      let adminToken = null;
      let userToken = null;

      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith('adminToken=')) {
          adminToken = cookie.substring('adminToken='.length, cookie.length);
        } else if (cookie.startsWith('userToken=')) {
          userToken = cookie.substring('userToken='.length, cookie.length);
        }
      }

      const token = adminToken || userToken; // Use either token if found

      if (token) {
        try {
          const response = await axios.get(`${backend_api}/api/users/details`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true,
          });

          if (response.data.success) {
            setIsAuthenticated(true);
            setUser(response.data.user);
          } else {
            // Token invalid or user not found, clear cookies
            document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            setIsAuthenticated(false);
            setUser({});
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          // Handle error (e.g., token expired, invalid)
          document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          setIsAuthenticated(false);
          setUser({});
        }
      } else {
        setIsAuthenticated(false);
        setUser({});
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        loading
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
