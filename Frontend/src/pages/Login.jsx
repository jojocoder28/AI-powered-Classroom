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
    <div className="min-h-screen bg-mint-cream dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl">
        {/* Left Section with Animation */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-teal-400 to-blue-500 dark:from-teal-600 dark:to-blue-700 p-8 relative overflow-hidden flex items-center justify-center">
          {/* Animated Blobs */}
          <div className="absolute w-72 h-72 bg-teal-300 dark:bg-teal-600 rounded-full filter blur-2xl opacity-50 animate-blob top-0 left-0"></div>
          <div className="absolute w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full filter blur-2xl opacity-50 animate-blob animation-delay-2000 top-10 right-0"></div>
          <div className="absolute w-72 h-72 bg-mint-cream dark:bg-gray-700 rounded-full filter blur-2xl opacity-40 animate-blob animation-delay-4000 bottom-10 left-0"></div>
          <div className="absolute w-72 h-72 bg-teal-500 dark:bg-teal-800 rounded-full filter blur-2xl opacity-40 animate-blob animation-delay-6000 bottom-0 right-0"></div>

          <div className="relative z-10 text-center text-white">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Welcome Back!</h2>
            <p className="text-md font-light">Login to access your dashboard</p>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full md:w-1/2 p-10 space-y-6 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Login</h2>

          {error && (
            <div className="bg-red-100 dark:bg-red-600 text-red-800 dark:text-white px-4 py-3 rounded text-sm">
              <strong>Error: </strong>{error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 dark:text-teal-400 focus:ring-teal-500 rounded"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Remember me</span>
              </label>
              <Link to="#" className="text-teal-500 hover:underline dark:text-teal-300">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition duration-300 ease-in-out font-semibold ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-500 hover:underline dark:text-teal-300">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
