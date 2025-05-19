import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaImage, FaSpinner } from 'react-icons/fa';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isLoading = false }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Pass the file to the parent component
      onImageUpload(file);
      
      // Free memory when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/dicom': [],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="w-full flex flex-col items-center">
            <img
              src={preview}
              alt="MRI Preview"
              className="max-h-64 max-w-full mb-4 rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-500">
              Click or drag to replace the image
            </p>
          </div>
        ) : (
          <div className="text-center">
            {isLoading ? (
              <FaSpinner className="h-12 w-12 text-primary-500 animate-spin mx-auto" />
            ) : (
              <>
                <FaUpload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? 'Drop the MRI scan here' : 'Drag & drop an MRI scan here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to select a file</p>
                <p className="text-xs text-gray-400 mt-2">
                  Supported formats: JPEG, PNG, DICOM
                </p>
              </>
            )}
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <FaSpinner className="animate-spin mr-2 text-primary-600" />
          <span className="text-gray-700">Processing image...</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
