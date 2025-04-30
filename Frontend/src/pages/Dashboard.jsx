import React, { useContext } from 'react'; // Import useContext
import { Link } from 'react-router-dom';
import { Context } from '../main'; // Import AuthContext (adjust path if needed)

function Dashboard() {
  const { user, isAuthenticated } = useContext(Context); // Consume the context

  if (!isAuthenticated) {
     return <p>Please log in to view the dashboard.</p>; 
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h1>
      
      {/* Add content for the dashboard here */}
      {isAuthenticated && user ? (
        <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
          Welcome back, <span className="font-semibold">{user.username || 'User'}</span>! Here you can see an overview of your activities.
        </p>
      ) : (
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Welcome to your dashboard. Please log in to see your personalized content.
        </p>
      )}

      {/* Link to Profile Page - styled as a button */}
      {isAuthenticated && (
        <Link 
          to="/profile" 
          className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition duration-150"
        >
          View User Profile
        </Link>
      )}
    </div>
  );
}

export default Dashboard;
