import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';
import NotFoundPage from './pages/NotFoundPage';
import { loadPyTorchModel } from './services/modelService';

const App: React.FC = () => {
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Check if the backend is connected when the app loads
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        console.log('Checking backend connection...');
        const isModelLoaded = await loadPyTorchModel();

        if (isModelLoaded) {
          setBackendConnected(true);
          setBackendError(null);
          console.log('Backend connection successful and model is loaded');
        } else {
          setBackendConnected(true); // Backend is connected but model might not be loaded
          setBackendError('Backend server is connected, but the model is not loaded properly. Some features may not work correctly.');
          console.warn('Backend connected but model not loaded');
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
        setBackendConnected(false);
        setBackendError('Could not connect to the backend server. Some features may not work properly.');
      }
    };

    checkBackendConnection();

    // Set up periodic health checks
    const healthCheckInterval = setInterval(async () => {
      try {
        const isModelLoaded = await loadPyTorchModel();
        setBackendConnected(isModelLoaded);
        if (isModelLoaded) {
          setBackendError(null);
        } else if (backendError === null) {
          setBackendError('Backend server is connected, but the model is not loaded properly. Some features may not work correctly.');
        }
      } catch (error) {
        setBackendConnected(false);
        if (backendError === null) {
          setBackendError('Lost connection to the backend server. Some features may not work properly.');
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [backendError]);

  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          {backendError && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
              <p className="font-bold">Backend Connection Warning</p>
              <p>{backendError}</p>
              <p className="text-sm mt-1">Please make sure the backend server is running at http://localhost:5001</p>
            </div>
          )}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<DashboardPage backendConnected={backendConnected} />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* 404 Page */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
