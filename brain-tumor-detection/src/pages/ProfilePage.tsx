import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { updateProfile, updateEmail } from 'firebase/auth';

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Update display name
      if (displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName });
      }
      
      // Update email
      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
      }
      
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center">
                <FaExclamationCircle className="text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-6">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="displayName"
                  className="input-field pl-10"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="input-field pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Changing your email will require you to verify the new email address.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
              <p className="mt-1">
                {currentUser?.metadata.creationTime 
                  ? new Date(currentUser.metadata.creationTime).toLocaleDateString() 
                  : 'Unknown'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Sign In</h3>
              <p className="mt-1">
                {currentUser?.metadata.lastSignInTime 
                  ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() 
                  : 'Unknown'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email Verified</h3>
              <p className="mt-1 flex items-center">
                {currentUser?.emailVerified 
                  ? <><FaCheckCircle className="text-green-500 mr-1" /> Verified</>
                  : <><FaExclamationCircle className="text-yellow-500 mr-1" /> Not verified</>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
