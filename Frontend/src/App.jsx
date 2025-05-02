import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Keep Footer for non-dashboard pages if needed, or remove if only on Home
import CopyrightElement from './elements/CopyrightElement';
import DashboardSidebar from './components/DashboardSidebar'; // Import the new sidebar
import { Context } from './main';
import './App.css';

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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { isAuthenticated } = useContext(Context);
  const location = useLocation();

  // Determine if the current route should have a sidebar
  const needsSidebar = location.pathname.startsWith('/dashboard') ||
                       location.pathname.startsWith('/classroom') ||
                       location.pathname.startsWith('/profile') ||
                       location.pathname.startsWith('/settings') ||
                       location.pathname.startsWith('/assignments') || // Assuming assignments and resources also use sidebar
                       location.pathname.startsWith('/resources');

  return (
    <div className="flex flex-col min-h-screen bg-mint-cream dark:bg-gray-900">
      <Navbar />

      {needsSidebar ? (
        <div className="flex flex-grow">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Main content area */}
          <main className="flex-grow overflow-y-auto p-8">
            <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading Page...</div>}>
              <Routes location={location}> {/* Use location prop here */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/classroom/:roomId" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                 {/* Add routes for Assignments and Resources if they use the sidebar */}
                 <Route path="/assignments" element={<ProtectedRoute><div>Assignments Page Placeholder</div></ProtectedRoute>} />
                 <Route path="/resources" element={<ProtectedRoute><div>Resources Page Placeholder</div></ProtectedRoute>} />

                {/* Redirect any unknown protected paths to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      ) : (
        <main className="flex-grow">
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading Page...</div>}>
             {/* Routes without sidebar */}
            <Routes location={location}> {/* Use location prop here */}
               {isAuthenticated ? (
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              ) : (
              <Route path="/" element={<Home />} />
              )}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/features" element={<div>Features Page Placeholder</div>} />
              <Route path="/contact" element={<div>Contact Page Placeholder</div>} />
              {/* Redirect any unknown public paths to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      )}

      {/* Render footer only on pages without sidebar, or handle within specific page components */}
       {!needsSidebar && <CopyrightElement name='Vidyana' link="/" />} {/* Add CopyrightElement */}
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
