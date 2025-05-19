import React from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FaBrain className="h-8 w-8 text-primary-400" />
            <span className="ml-2 text-xl font-bold">BrainScan AI</span>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="mb-4 md:mb-0 md:mr-8">
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul>
                <li className="mb-1"><Link to="/" className="hover:text-primary-400">Home</Link></li>
                <li className="mb-1"><Link to="/dashboard" className="hover:text-primary-400">Dashboard</Link></li>
                <li className="mb-1"><Link to="/" className="hover:text-primary-400">About</Link></li>
                <li className="mb-1"><Link to="/" className="hover:text-primary-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <FaGithub className="h-6 w-6" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <FaTwitter className="h-6 w-6" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <FaLinkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} BrainScan AI. All rights reserved.</p>
          <p className="mt-2">A powerful tool for brain tumor detection using advanced AI technology.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
