import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import ResultDisplay from '../components/ResultDisplay';
import { FaHistory, FaUpload, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import { uploadImage } from '../services/storage';
import { analyzeMRIScan } from '../services/modelService';
import { addScanResult, getUserScanResults, ScanResult } from '../services/database';
import { Timestamp } from 'firebase/firestore';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (currentUser && activeTab === 'history') {
      loadScanHistory();
    }
  }, [currentUser, activeTab]);

  const loadScanHistory = async () => {
    if (!currentUser) return;

    try {
      setIsLoadingHistory(true);
      const results = await getUserScanResults(currentUser.uid);
      setScanHistory(results);
    } catch (err) {
      console.error('Error loading scan history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setImageUrl(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !currentUser) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      // Upload image to Firebase Storage
      const url = await uploadImage(
        selectedFile,
        currentUser.uid,
        (progress) => setUploadProgress(progress)
      );
      setImageUrl(url);

      // Analyze the image using the model
      const result = await analyzeMRIScan(selectedFile);
      setAnalysisResult(result);

      // Save the result to the database
      await addScanResult({
        userId: currentUser.uid,
        imageUrl: url,
        result,
        createdAt: Timestamp.now(),
      });

    } catch (err: any) {
      console.error('Error analyzing image:', err);
      setError(err.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const handleTabChange = (tab: 'upload' | 'history') => {
    setActiveTab(tab);
    setError(null);

    if (tab === 'upload') {
      setSelectedFile(null);
      setAnalysisResult(null);
      setImageUrl(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('upload')}
            className={`${
              activeTab === 'upload'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FaUpload className="mr-2" />
            Upload & Analyze
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FaHistory className="mr-2" />
            Scan History
          </button>
        </nav>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Upload & Analyze Tab */}
      {activeTab === 'upload' && (
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload MRI Scan</h2>
            <ImageUploader
              onImageUpload={handleFileUpload}
              isLoading={isAnalyzing}
            />

            {selectedFile && !isAnalyzing && !analysisResult && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  className="btn-primary flex items-center"
                  disabled={isAnalyzing}
                >
                  Analyze Scan
                </button>
              </div>
            )}
          </div>

          {analysisResult && imageUrl && (
            <ResultDisplay result={analysisResult} imageUrl={imageUrl} />
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Scan History</h2>

          {isLoadingHistory ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
              <span className="ml-2 text-gray-600">Loading history...</span>
            </div>
          ) : scanHistory.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">No scan history found. Upload your first MRI scan to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">
                        {scan.result.hasTumor ? 'Tumor Detected' : 'No Tumor Detected'}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {scan.createdAt.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex">
                    <div className="w-1/3">
                      <img
                        src={scan.imageUrl}
                        alt="MRI Scan"
                        className="w-full h-auto rounded"
                      />
                    </div>
                    <div className="w-2/3 pl-4">
                      <p className="text-sm mb-2">
                        <span className="font-medium">Confidence:</span>{' '}
                        {Math.round(scan.result.confidence * 100)}%
                      </p>
                      {scan.result.hasTumor && scan.result.tumorType && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Type:</span>{' '}
                          {scan.result.tumorType}
                        </p>
                      )}
                      {scan.notes && (
                        <p className="text-sm">
                          <span className="font-medium">Notes:</span>{' '}
                          {scan.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
