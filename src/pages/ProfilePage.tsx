import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { getUserScanResults, ScanResult } from '../services/database';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [tumorDetectedCount, setTumorDetectedCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      loadUserStats();
    }
  }, [currentUser]);

  const loadUserStats = async () => {
    if (!currentUser) return;
    
    try {
      const results = await getUserScanResults(currentUser.uid);
      setScanCount(results.length);
      
      const tumorCount = results.filter(scan => scan.result.hasTumor).length;
      setTumorDetectedCount(tumorCount);
    } catch (err) {
      console.error('Error loading user stats:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await updateUserProfile(displayName);
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <div className="flex items-center">
                  <FaExclamationCircle className="mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                <div className="flex items-center">
                  <FaCheckCircle className="mr-2" />
                  <span>{success}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="form-label">
                    Display Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="form-input pl-10"
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={currentUser.email || ''}
                      className="form-input pl-10"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
                
                {isEditing ? (
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(currentUser.displayName || '');
                        setError(null);
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value="••••••••"
                    className="form-input pl-10"
                    disabled
                  />
                </div>
              </div>
              
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  // This would typically open a modal or navigate to a password reset page
                  alert('Password reset functionality would be implemented here');
                }}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
        
        {/* Account Statistics */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Account Statistics</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-medium">
                  {currentUser.metadata.creationTime
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                    : 'Unknown'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Last Sign In</p>
                <p className="font-medium">
                  {currentUser.metadata.lastSignInTime
                    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                    : 'Unknown'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Total Scans Analyzed</p>
                <p className="text-2xl font-bold text-primary-600">{scanCount}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Tumors Detected</p>
                <p className="text-2xl font-bold text-primary-600">{tumorDetectedCount}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Detection Rate</p>
                <p className="text-2xl font-bold text-primary-600">
                  {scanCount > 0 ? `${Math.round((tumorDetectedCount / scanCount) * 100)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            
            <div className="space-y-4">
              <button
                type="button"
                className="w-full btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => {
                  // This would typically open a confirmation modal
                  alert('Account deletion functionality would be implemented here');
                }}
              >
                Delete Account
              </button>
              
              <p className="text-xs text-gray-500">
                Deleting your account will permanently remove all your data from our system.
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
