import React from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaExclamationTriangle } from 'react-icons/fa';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <FaExclamationTriangle className="mx-auto h-16 w-16 text-primary-600" />
        <h1 className="mt-4 text-4xl font-bold text-gray-900 tracking-tight">Page not found</h1>
        <p className="mt-2 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 font-medium px-8 py-3 text-base rounded-md shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            style={{ cursor: 'pointer' }}
            aria-label="Return to homepage"
          >
            Go back home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center bg-white text-primary-600 border-2 border-primary-300 hover:bg-primary-50 font-medium px-8 py-3 text-base rounded-md shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            style={{ cursor: 'pointer' }}
            aria-label="Contact support team"
          >
            Contact support
          </Link>
        </div>
        <div className="mt-12">
          <FaBrain className="mx-auto h-10 w-10 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
