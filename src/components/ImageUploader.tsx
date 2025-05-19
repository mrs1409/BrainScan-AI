import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaSpinner } from 'react-icons/fa';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
  resetOnComplete?: boolean;
  showPreview?: boolean;
  selectedFile: File | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  isLoading = false,
  resetOnComplete = false,
  showPreview = true,
  selectedFile = null
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  // Create preview when a file is selected
  useEffect(() => {
    if (selectedFile && showPreview) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);

      // Free memory when component unmounts or when file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [selectedFile, showPreview]);

  // Clear preview when analysis is complete if resetOnComplete is true
  useEffect(() => {
    if (resetOnComplete && !isLoading) {
      setPreview(null);
    }
  }, [isLoading, resetOnComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageUpload(file);
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

  // If we're loading, show only the loading indicator
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mt-4">
          <div className="flex items-center justify-center mb-2">
            <FaSpinner className="animate-spin mr-2 text-primary-600" />
            <span className="text-gray-700 font-medium">Processing image...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div className="h-2.5 rounded-full bg-primary-600 animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-center text-gray-500">
            This may take a few moments. Please don't refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        }`}
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
            <FaUpload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'Drop the MRI scan here' : 'Drag & drop an MRI scan here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to select a file</p>
            <p className="text-xs text-gray-400 mt-2">
              Supported formats: JPEG, PNG, DICOM
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
