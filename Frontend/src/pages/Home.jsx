import React from 'react';
import { useAuth } from '../main'; // Adjust the path based on your file structure
import { Link } from 'react-router-dom';
import ThemeSwitch from '../components/ThemeSwitch';

function Home() {
  // Consume the authentication context
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // If the context is still loading the auth status, show a message
  if (isLoading) {
    return <div>Loading user information...</div>;
  }

  return (
    <div>
                 
      <h1>Welcome to the Home Page</h1>
      
      {isAuthenticated ? (
        // Content shown when the user IS authenticated
        <div>
          <p>Hello, {user?.name || 'User'}! (Email: {user?.email || 'N/A'})</p>
          <p>You are logged in.</p>
          <Link to="/dashboard">Go to Dashboard</Link>
          <br />
          {/* Link to classroom already exists here, but we add the explicit test section below too */}
          <Link to="/profile">View Profile</Link>
          <br />
          <button onClick={logout}>Logout</button> 
        </div>
      ) : (
        // Content shown when the user IS NOT authenticated
        <div>
          <p>You are not logged in.</p>
          <Link to="/login">Login</Link>
          <br />
          <Link to="/register">Register</Link>
        </div>
      )}

      {/* --- Temporary Testing Section --- */}
      <div style={{ border: '1px dashed blue', padding: '10px', marginTop: '20px' }}>
        <h2 className='text-center text-6xl'>Temporary Test Section</h2>
        <p>Use this link to quickly navigate to the classroom page:</p>
        <Link to="/classroom" style={{ color: 'blue', textDecoration: 'underline' }}>
          Go to Classroom Page
        </Link>
      </div>
      {/* --- End Temporary Testing Section --- */}
      
      {/* You can add more general home page content here */}
      <p style={{ marginTop: '20px' }}>This is the public content of the home page.</p>
    </div>

  );
}

export default Home;
