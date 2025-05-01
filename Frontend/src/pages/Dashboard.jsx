'use strict';
import React, { useContext } from 'react'; // Import useContext
import { Link } from 'react-router-dom';
import { Context } from '../main'; // Import AuthContext (adjust path if needed)
import MyClassrooms from '../components/MyClassrooms'; // Import the new component

function Dashboard() {
  const { user, isAuthenticated } = useContext(Context); // Consume the context

  // Redirect or show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <p className="text-lg text-gray-700 dark:text-gray-300">Please log in to view the dashboard.</p>
        <Link to="/login" className="text-indigo-600 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h1>

      {/* Welcome message */}
      {user && (
        <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
          Welcome back, <span className="font-semibold">{user.username || 'User'}</span>! Role: <span className="font-semibold">{user.role}</span>
        </p>
      )}

      {/* Conditional role-based message */}
      {user && user.role === 'Student' ? (
        <div className="text-green-700 dark:text-green-400 font-semibold mb-4">
          Welcome, Student! Here are your enrolled classrooms and resources.
        </div>
      ) : (
        <div className="text-blue-700 dark:text-blue-400 font-semibold mb-4">
           Welcome, Teacher/Admin! Here's your dashboard overview.
        </div>
      )}

      {/* Link to Profile Page */}
      <Link 
        to="/profile" 
        className="inline-block px-6 py-2 mb-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition duration-150"
      >
        View User Profile
      </Link>

      {/* Display the classrooms list */}
      <MyClassrooms />

      {/* Add other dashboard widgets or links here */}
    </div>
  );
}

export default Dashboard;
