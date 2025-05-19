import React from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaLaptopMedical, FaUserMd, FaChartLine, FaShieldAlt, FaGlobe } from 'react-icons/fa';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">About BrainScan AI</h1>
            <p className="text-xl">
              Revolutionizing brain tumor detection with advanced artificial intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-6">
              At BrainScan AI, our mission is to improve the accuracy and efficiency of brain tumor detection
              through cutting-edge artificial intelligence technology. We aim to provide medical professionals
              with powerful tools that enhance their diagnostic capabilities and ultimately improve patient outcomes.
            </p>
            <p className="text-lg text-gray-700">
              We believe that by combining advanced AI algorithms with medical expertise, we can create a future
              where brain tumors are detected earlier, diagnosed more accurately, and treated more effectively.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="bg-gray-50 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Technology</h2>
            <p className="text-lg text-gray-700 mb-6">
              BrainScan AI utilizes state-of-the-art deep learning models specifically trained on thousands of
              MRI scans to detect and classify brain tumors with high accuracy. Our technology is built on:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-primary-600 mb-4">
                  <FaBrain className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Neural Networks</h3>
                <p className="text-gray-600">
                  Advanced convolutional neural networks designed specifically for medical image analysis
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-primary-600 mb-4">
                  <FaLaptopMedical className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Medical Expertise</h3>
                <p className="text-gray-600">
                  Developed in collaboration with leading neurologists and radiologists
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-primary-600 mb-4">
                  <FaChartLine className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Continuous Learning</h3>
                <p className="text-gray-600">
                  Our models continuously improve through ongoing training with new data
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-primary-600 mb-4">
                  <FaShieldAlt className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacy-Focused</h3>
                <p className="text-gray-600">
                  Built with privacy and security as core principles, ensuring patient data protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Us in Revolutionizing Healthcare</h2>
            <p className="text-lg text-gray-700 mb-8">
              Whether you're a healthcare provider looking to enhance your diagnostic capabilities or a
              researcher interested in our technology, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
