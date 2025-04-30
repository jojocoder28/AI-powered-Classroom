import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../main';
import { backend_api } from '../config';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${backend_api}/api/users/login`, {
        email,
        password,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      // ---- Login Success ----
      console.log('Login successful:', response.data);

      // 1. Store the token (e.g., in localStorage)
      localStorage.setItem('token', response.data.token);

      // 2. Update authentication state in context
      setIsAuthenticated(true);

      // 3. Update user data in context
      setUser(response.data.user); 
      console.log(response.data.user)
      navigate('/dashboard'); // Redirect to dashboard

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to login');
      console.error('Login error:', err);
      setIsAuthenticated(false); // Ensure state is false on error
      setUser([]);
      localStorage.removeItem('token'); // Clear token on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-amber-300 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 rounded-xl shadow-lg p-8 bg-gray-100 neomorphic">
        <div className="flex justify-end">
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-700">
            Sign in
          </h2>
        </div>
        {error && <p className="text-center text-red-500 text-sm">{error}</p>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm bg-gray-100 neomorphic-inset"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            <div className='pt-2'>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm bg-gray-100 neomorphic-inset"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Remember me / Forgot Password section - kept as is for now */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded bg-gray-100 neomorphic-inset"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
             {/* <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-amber-600 hover:text-amber-500">
                Forgot password?
              </Link>
            </div> */}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-800 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 neomorphic ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-amber-600 hover:text-amber-500">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
