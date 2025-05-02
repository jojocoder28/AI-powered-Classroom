import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Import Footer
import CopyrightElement from './elements/CopyrightElement'; // Import CopyrightElement
import { Context } from './main';
import './App.css'; // Keep existing App styles

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Classroom = lazy(() => import('./pages/Classroom'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
// const VideoPage = lazy(() => import('./components/VideoPage')); // Lazy load VideoPage

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(Context);

  if (loading) {
    // Optional: Show a loading spinner while checking auth state
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { isAuthenticated } = useContext(Context);

  return (
    <div className="flex flex-col min-h-screen bg-mint-cream dark:bg-gray-900">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading Page...</div>}>
          <Routes>
            {/* Public Routes */}
            {isAuthenticated ? (
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            ) : (
            <Route path="/" element={<Home />} />
            )}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Add other public routes like /features, /contact if needed */}
             <Route path="/features" element={<div>Features Page Placeholder</div>} />
             <Route path="/contact" element={<div>Contact Page Placeholder</div>} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/classroom/:roomId"
              element={<ProtectedRoute><Classroom /></ProtectedRoute>}
            />
             {/* <Route
              path="/classroom/:roomId/video"
              element={<ProtectedRoute><VideoPage /></ProtectedRoute>}
            /> */}
             <Route
              path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route
              path="/profile/:userId"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route
              path="/settings"
              element={<ProtectedRoute><Settings /></ProtectedRoute>}
            />

            {/* Redirect any unknown paths to home or a 404 page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer /> {/* Add Footer component */}
      <CopyrightElement name='Vidyana' link="/" /> {/* Add CopyrightElement */}
    </div>
  );
}

function App() {
  return (
      <Router>
        <AppContent />
      </Router>
  );
}

export default App;
