import React from 'react';
import { FaBrain, FaCloudUploadAlt, FaChartLine, FaLock, FaGlobeAmericas, FaHospital, FaBriefcaseMedical } from 'react-icons/fa';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container py-24 pb-32">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Advanced Brain Tumor Detection with AI
              </h1>
              <p className="text-xl mb-8">
                Our cutting-edge AI technology helps detect brain tumors from MRI scans with high accuracy,
                providing quick and reliable results to support medical professionals.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 relative z-10">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center bg-white text-primary-700 hover:bg-gray-100 font-medium px-8 py-3 text-base rounded-md shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white no-underline"
                  aria-label="Get started with BrainScan AI"
                  style={{ position: 'relative', zIndex: 20 }}
                >
                  Get Started
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium px-8 py-3 text-base rounded-md cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white no-underline"
                  aria-label="Learn more about BrainScan AI"
                  style={{ position: 'relative', zIndex: 20 }}
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-full flex items-center justify-center">
                <FaBrain className="w-32 h-32 md:w-40 md:h-40 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-10 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,160L48,170.7C96,181,192,203,288,202.7C384,203,480,181,576,176C672,171,768,181,864,186.7C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines advanced AI technology with a user-friendly interface to provide
              accurate brain tumor detection and analysis.
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
                Advanced AI model trained on thousands of MRI scans for high accuracy detection
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 mb-4">
                <FaLock className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
              <p className="text-gray-600">
                All patient data and scan results are securely stored with end-to-end encryption
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy to get accurate brain tumor detection in just a few simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload MRI Scan</h3>
              <p className="text-gray-600">
                Upload your MRI scan through our secure and easy-to-use interface
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI model analyzes the scan with high precision
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p className="text-gray-600">
                Receive detailed analysis results with visualization and recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Impact Section */}
      <div className="bg-gray-50 py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Global Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              BrainScan AI is transforming healthcare worldwide, making advanced brain tumor detection accessible to all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-primary-600 mb-4 flex justify-center">
                <FaGlobeAmericas className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Accessibility</h3>
              <p className="text-gray-600">
                Our technology bridges healthcare gaps by providing advanced diagnostic capabilities to underserved regions worldwide, ensuring quality care is available regardless of location.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-primary-600 mb-4 flex justify-center">
                <FaHospital className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Healthcare Transformation</h3>
              <p className="text-gray-600">
                By empowering medical facilities with AI-assisted diagnosis, we're helping healthcare providers deliver faster, more accurate care to patients across continents.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-primary-600 mb-4 flex justify-center">
                <FaBriefcaseMedical className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Improved Patient Outcomes</h3>
              <p className="text-gray-600">
                Our platform enables earlier detection and more precise diagnosis, leading to better treatment planning and improved survival rates for brain tumor patients globally.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700 text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of medical professionals who trust our platform for accurate brain tumor detection.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 relative z-10">
            <a
              href="/register"
              className="inline-flex items-center justify-center bg-white text-primary-700 hover:bg-gray-100 font-medium px-8 py-3 text-base rounded-md shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white no-underline"
              aria-label="Sign up for BrainScan AI"
              style={{ position: 'relative', zIndex: 20 }}
            >
              Sign Up Now
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium px-8 py-3 text-base rounded-md cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white no-underline"
              aria-label="Contact BrainScan AI team"
              style={{ position: 'relative', zIndex: 20 }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
