import React, { useState, useContext } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Context } from '../main';
import { backend_api } from '../config';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${backend_api}/api/users/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const token = response.data.token;
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/`;

      setIsAuthenticated(true);
      setUser(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to login');
      setIsAuthenticated(false);
      setUser([]);
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-mint-cream dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white dark:bg-gray-700 rounded-2xl shadow-2xl overflow-hidden border border-teal-100 dark:border-teal-800">
        {/* Left Section - Simple Color */}
        {/* Blobs removed as requested in a previous step */}
        <div className="w-full md:w-1/2 bg-teal-500 dark:bg-teal-700 p-8 flex items-center justify-center text-white">
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">Welcome Back!</h2>
            <p className="text-md font-light">Login to access your dashboard and continue your learning journey.</p>
          </div>
        </div>

        {/* Right Section - Login Form (Fields Left Aligned) */}
        <div className="w-full md:w-1/2 p-10 space-y-6 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-teal-800 dark:text-mint-cream">Sign In</h2>

          {error && (
            <div className="bg-red-100 dark:bg-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded text-sm border border-red-200 dark:border-red-600" role="alert">
              <strong className="font-bold">Error: </strong>{error}
            </div>
          )}

          <form className="space-y-6 text-left" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm bg-mint-cream dark:bg-gray-800 text-left"
                placeholder="Email address"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm bg-mint-cream dark:bg-gray-800 text-left"
                placeholder="Password"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded dark:text-teal-500 dark:focus:ring-teal-600 dark:border-gray-600 bg-mint-cream dark:bg-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 text-left">
                  Remember me
                </label>
              </div>
              <Link to="#" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">Forgot Password?</Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-left">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;