import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaExternalLinkAlt, FaSync, FaSpinner } from 'react-icons/fa';

interface FirestoreIndexHelperProps {
  error: string | null;
  onRetry?: () => void;
}

const FirestoreIndexHelper: React.FC<FirestoreIndexHelperProps> = ({ error, onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [indexUrl, setIndexUrl] = useState<string | null>(null);

  // Extract the index URL from the error message using a more robust approach
  useEffect(() => {
    if (!error) return;

    // Try multiple regex patterns to extract the URL
    const patterns = [
      /https:\/\/console\.firebase\.google\.com\/[^"\s\\]+(\\[^"\s\\]+)*/,
      /https:\/\/console\.firebase\.google\.com\/[^\s]+/,
      /https:\/\/console\.firebase\.google\.com[^\s]*/
    ];

    let extractedUrl: string | null = null;

    for (const pattern of patterns) {
      const match = error.match(pattern);
      if (match && match[0]) {
        extractedUrl = match[0];
        break;
      }
    }

    // If we still don't have a URL, use the hardcoded one from the error message
    if (!extractedUrl && error.includes('brain-tumor-detection-4e0ff')) {
      extractedUrl = "https://console.firebase.google.com/v1/r/project/brain-tumor-detection-4e0ff/firestore/indexes?create_composite=Cl9wcm9qZWN0cy9icmFpbi10dW1vci1kZXRlY3Rpb24tNGUwZmYvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3NjYW5SZXN1bHRzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI";
    }

    // Clean up the URL if it contains escaped characters
    if (extractedUrl) {
      extractedUrl = extractedUrl
        .replace(/\\\//g, '/')
        .replace(/\\=/g, '=')
        .replace(/\\&/g, '&')
        .replace(/\\%/g, '%');
    }

    setIndexUrl(extractedUrl);
  }, [error]);

  // Handle retry with a delay to allow index to be created
  const handleRetry = () => {
    if (!onRetry) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Add a delay before retrying to give time for the index to be created
    setTimeout(() => {
      onRetry();
      setIsRetrying(false);
    }, 2000);
  };

  if (!error) return null;
  if (!indexUrl) return null;

  return (
    <div className="bg-blue-50 border-2 border-blue-300 text-blue-800 p-6 rounded-lg mb-6 shadow-md">
      <div className="flex items-start">
        <FaExclamationTriangle className="text-blue-500 mt-1 mr-3 flex-shrink-0 text-xl" />
        <div className="w-full">
          <h3 className="font-bold text-blue-800 text-lg mb-2">Firestore Index Required</h3>
          <p className="mb-4">
            Your scan history can't be displayed because Firestore needs an index to efficiently query the data.
            This is a <span className="font-semibold">one-time setup</span> that requires admin access to your Firebase project.
          </p>

          <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4 overflow-hidden">
            <p className="font-medium mb-2">To fix this issue:</p>
            <ol className="list-decimal pl-5 mb-3 text-sm space-y-2">
              <li>Click the "Create Index" button below</li>
              <li>Sign in with your Firebase admin account if prompted</li>
              <li>Click the "Create Index" button on the Firebase page that opens</li>
              <li>Wait for the index to finish building (may take a few minutes)</li>
              <li>Return to this page and click "Try Again" to view your scan history</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-3 mb-2">
            <a
              href={indexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center font-medium"
            >
              <FaExternalLinkAlt className="mr-2" />
              Create Index
            </a>

            {onRetry && (
              <>
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className={`${isRetrying
                    ? 'bg-gray-100 text-gray-500 cursor-wait'
                    : 'bg-white hover:bg-blue-50 text-blue-700'}
                    border border-blue-300 px-5 py-2 rounded-md flex items-center font-medium`}
                >
                  {isRetrying ? (
                    <>
                      <FaSpinner className="mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <FaSync className="mr-2" />
                      Try Again {retryCount > 0 ? `(${retryCount})` : ''}
                    </>
                  )}
                </button>

                {/* Add a force refresh button for when the index is created but not being detected */}
                <button
                  onClick={() => {
                    // Force a page reload to clear all caches
                    window.location.reload();
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-md flex items-center font-medium"
                >
                  <FaSync className="mr-2" />
                  Force Refresh
                </button>
              </>
            )}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            <p className="font-medium mb-1">Important:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Index creation can take several minutes to complete</li>
              <li>You must wait for the index to finish building before your scan history will appear</li>
              <li>If you've already created the index, please wait a few minutes and try again</li>
              <li>If you've created the index but still see this message, try the "Force Refresh" button</li>
              <li>Once created, the index will be available for all users of your application</li>
            </ul>
          </div>

          {retryCount > 2 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <p className="font-medium mb-1">Troubleshooting:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Make sure you clicked "Create Index" in the Firebase console</li>
                <li>Check that the index status shows "Enabled" in the Firebase console</li>
                <li>Try the "Force Refresh" button to reload the page completely</li>
                <li>If problems persist, try clearing your browser cache or using a different browser</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirestoreIndexHelper;
