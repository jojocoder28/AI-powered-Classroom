import React from 'react';
import { useAuth } from '../main'; // Adjust the path based on your file structure
import { Link } from 'react-router-dom';

function Home() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Welcome to the Home Page
        </h1>

        {isAuthenticated ? (
          <div className="space-y-4 text-center">
            <p className="text-lg text-gray-700">
              Hello, <span className="font-semibold">{user?.name || 'User'}</span>!
            </p>
            <p className="text-gray-600">Email: {user?.email || 'N/A'}</p>
            <p className="text-green-600 font-medium">You are logged in.</p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <Link
                to="/dashboard"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/profile"
                className="px-5 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
              >
                View Profile
              </Link>
              <button
                onClick={logout}
                className="px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-gray-700 text-lg">You are not logged in.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* --- Temporary Testing Section --- */}
        <div className="mt-10 border-2 border-dashed border-blue-400 rounded-xl p-6 bg-blue-50">
          <h2 className="text-xl font-semibold text-blue-700 mb-2">
            Temporary Test Section
          </h2>
          <p className="text-gray-600 mb-2">
            Use this link to quickly navigate to the classroom page:
          </p>
          <Link
            to="/classroom"
            className="text-blue-600 hover:underline font-medium"
          >
            Go to Classroom Page
          </Link>
        </div>

        {/* General Home Page Content */}
        <p className="mt-8 text-center text-gray-500">
          This is the public content of the home page.
        </p>
      </div>
    </div>
  );
}

export default Home;
