import React, { StrictMode, createContext, useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// --- Authentication Context Setup --- 

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken')); // Initialize token from localStorage
  const [user, setUser] = useState(null); // To store user details
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('authToken')); // True if token exists initially
  const [isLoading, setIsLoading] = useState(true); // To handle initial loading/validation

  // Effect to potentially validate token and fetch user data on load
  useEffect(() => {
    const validateTokenAndFetchUser = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        // In a real app, you would make an API call here to validate the token
        // and fetch user data if the token is valid.
        try {
          // --- Placeholder for API call ---
          // Example: const response = await fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${storedToken}` } });
          // if (!response.ok) throw new Error('Invalid token');
          // const userData = await response.json();
          // setUser(userData);
          // setToken(storedToken); // Ensure token state is set if validation passes
          // setIsAuthenticated(true);
          console.log("Auth: Token found in localStorage, assuming valid for now.");
          // --- Simulation: Assume token is valid, maybe fetch mock user ---
          // For demonstration, let's set a mock user if authenticated
          setUser({ name: "Mock User", email: "mock@example.com" }); 
          setIsAuthenticated(true); // Already set based on initial state, confirm here
          setToken(storedToken); // Ensure state matches localStorage
        } catch (error) {
          console.error("Auth: Token validation failed:", error);
          // Token is invalid or expired, clear it
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
         // No token found
         setIsAuthenticated(false);
      }
      setIsLoading(false); // Finished loading/validation attempt
    };

    validateTokenAndFetchUser();
  }, []); // Run only once on component mount

  // Login function
  const login = (newToken, userData) => {
    localStorage.setItem('authToken', newToken); // Persist token
    setToken(newToken);
    setUser(userData); // Set user details
    setIsAuthenticated(true);
    console.log("Auth: User logged in, token set.");
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken'); // Remove token from storage
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log("Auth: User logged out.");
    // Optional: Redirect or handle post-logout actions
  };

  // The value provided to consuming components
  const authContextValue = {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser // Allow updating user info (e.g., profile update)
  };

  // Don't render children until loading/validation is complete
  return (
    <AuthContext.Provider value={authContextValue}>
      {!isLoading ? children : <div>Loading Authentication...</div>} {/* Show loading indicator */}
    </AuthContext.Provider>
  );
};

// 3. Create the Custom Hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) { // Added null check for robustness
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- End Authentication Context Setup ---

// Render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> { /* Wrap App with the Auth Provider */ }
      <App />
    </AuthProvider>
  </StrictMode>,
);
