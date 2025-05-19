import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSpinner, FaDatabase, FaExclamationCircle } from 'react-icons/fa';

interface ResultDisplayProps {
  result: {
    hasTumor: boolean;
    confidence: number;
    tumorType?: string;
  };
  imageUrl: string;
  isSavingToDatabase?: boolean;
  dbSaveError?: string | null;
  savedToDatabase?: boolean;
  onRetrySave?: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  imageUrl,
  isSavingToDatabase = false,
  dbSaveError = null,
  savedToDatabase = false,
  onRetrySave
}) => {
  const { hasTumor, confidence, tumorType } = result;

  // Format confidence as percentage
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Analysis Results</h2>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 mb-4 md:mb-0 md:pr-4">
            <img
              src={imageUrl}
              alt="MRI Scan"
              className="w-full h-auto rounded-lg shadow-sm"
            />
          </div>

          <div className="md:w-1/2 md:pl-4">
            <div className={`p-4 rounded-lg mb-4 ${
              hasTumor
                ? 'bg-red-50 border border-red-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center mb-2">
                {hasTumor ? (
                  <FaExclamationTriangle className="text-red-500 mr-2 text-xl" />
                ) : (
                  <FaCheckCircle className="text-green-500 mr-2 text-xl" />
                )}
                <h3 className="text-xl font-semibold">
                  {hasTumor ? 'Tumor Detected' : 'No Tumor Detected'}
                </h3>
              </div>

              <p className="text-gray-700">
                {hasTumor
                  ? 'Our analysis indicates the presence of a brain tumor in the provided MRI scan.'
                  : 'Our analysis indicates no presence of a brain tumor in the provided MRI scan.'
                }
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-1">Confidence Level</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    hasTumor ? 'bg-red-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${confidencePercent}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{confidencePercent}% confidence</p>
            </div>

            {hasTumor && tumorType && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-1">Tumor Type</h4>
                <p className="text-gray-900 font-semibold">{tumorType}</p>
              </div>
            )}

            {/* Database save status */}
            <div className="mt-4 mb-2">
              {isSavingToDatabase && (
                <div className="flex items-center text-blue-600">
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Saving to your scan history...</span>
                </div>
              )}

              {!isSavingToDatabase && savedToDatabase && (
                <div className="flex items-center text-green-600">
                  <FaCheckCircle className="mr-2" />
                  <span>Saved to your scan history</span>
                </div>
              )}

              {!isSavingToDatabase && dbSaveError && (
                <div className="flex items-start text-red-600 bg-red-50 p-3 rounded">
                  <FaExclamationCircle className="mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Failed to save to scan history</p>
                    <p className="text-sm mb-2">{dbSaveError}</p>
                    {onRetrySave && (
                      <button
                        onClick={onRetrySave}
                        className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-300 flex items-center inline-flex"
                      >
                        <FaDatabase className="mr-1" /> Retry saving to history
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500 italic">
                Note: This is an automated analysis and should not replace professional medical advice.
                Please consult with a healthcare professional for proper diagnosis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
