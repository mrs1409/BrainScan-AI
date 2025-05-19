import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CheckEnv from './CheckEnv';

const SimpleApp: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-primary-600">BrainScan AI</h1>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Welcome to BrainScan AI</h2>
            <p className="mb-4">
              This is a simplified version of the application to test if the basic React and Tailwind CSS setup is working.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h3 className="font-medium text-primary-700">Feature 1</h3>
                <p className="text-gray-600">Description of feature 1</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <h3 className="font-medium text-primary-700">Feature 2</h3>
                <p className="text-gray-600">Description of feature 2</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <h3 className="font-medium text-primary-700">Feature 3</h3>
                <p className="text-gray-600">Description of feature 3</p>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded">
                Test Button
              </button>
            </div>
          </div>
          
          {/* Environment Variables Check */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Environment Variables</h2>
            <CheckEnv />
          </div>
          
          {/* Debug Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <div className="space-y-2">
              <div>
                <strong>NODE_ENV:</strong> {import.meta.env.MODE}
              </div>
              <div>
                <strong>Vite Base URL:</strong> {import.meta.env.BASE_URL}
              </div>
              <div>
                <strong>Browser:</strong> {navigator.userAgent}
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4">
            <p className="text-center">© 2025 BrainScan AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default SimpleApp;
