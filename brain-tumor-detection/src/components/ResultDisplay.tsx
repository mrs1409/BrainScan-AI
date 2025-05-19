import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

interface ResultDisplayProps {
  result: {
    hasTumor: boolean;
    confidence: number;
    tumorType?: string;
  };
  imageUrl: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, imageUrl }) => {
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
