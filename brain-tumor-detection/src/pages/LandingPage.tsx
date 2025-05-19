import React from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaCloudUploadAlt, FaChartLine, FaUserMd, FaLock } from 'react-icons/fa';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Advanced Brain Tumor Detection with AI
              </h1>
              <p className="text-xl mb-8">
                Our cutting-edge AI technology helps detect brain tumors from MRI scans with high accuracy,
                providing quick and reliable results to support medical professionals.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="btn-primary text-center py-3 px-6 text-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="bg-white text-primary-700 hover:bg-gray-100 font-medium py-3 px-6 rounded-md transition-colors text-center text-lg"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <FaBrain className="w-64 h-64 text-white opacity-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
            <p className="mt-4 text-xl text-gray-600">
              Our platform offers powerful tools for brain tumor detection and analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 mb-4">
                <FaCloudUploadAlt className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
              <p className="text-gray-600">
                Simple drag-and-drop interface for uploading MRI scans in various formats
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 mb-4">
                <FaChartLine className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accurate Analysis</h3>
              <p className="text-gray-600">
                Advanced AI model trained on thousands of MRI scans for high-precision tumor detection
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 mb-4">
                <FaUserMd className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Patient History</h3>
              <p className="text-gray-600">
                Maintain a comprehensive history of all scans and results for each patient
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of medical professionals who trust our platform for quick and accurate brain tumor detection.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-700 hover:bg-gray-100 font-medium py-3 px-8 rounded-md transition-colors text-lg inline-block"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
