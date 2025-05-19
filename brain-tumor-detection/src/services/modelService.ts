// This service handles the communication with the backend API that runs the PyTorch model

interface ModelResponse {
  hasTumor: boolean;
  confidence: number;
  tumorType?: string;
}

// API URL - in a real application, this would be in an environment variable
const API_URL = 'http://localhost:5000';

/**
 * Analyzes an MRI scan by sending it to the backend API
 * @param imageFile The MRI scan image file
 * @returns Analysis result from the model
 */
export const analyzeMRIScan = async (imageFile: File): Promise<ModelResponse> => {
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    // Make the API call to the backend
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze MRI scan');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing MRI scan:', error);
    throw new Error('Failed to analyze MRI scan. Please try again later.');
  }
};

/**
 * Checks if the backend model is loaded and ready
 * @returns True if the model is loaded and ready
 */
export const loadPyTorchModel = async (): Promise<void> => {
  try {
    console.log('Checking if PyTorch model is loaded...');

    const response = await fetch(`${API_URL}/api/health`);

    if (!response.ok) {
      throw new Error('Failed to check model status');
    }

    const data = await response.json();

    if (data.model_loaded) {
      console.log('PyTorch model is loaded and ready');
    } else {
      console.warn('PyTorch model is not loaded. Some features may not work correctly.');
    }
  } catch (error) {
    console.error('Error checking model status:', error);
    console.warn('Could not connect to the model backend. Using fallback mode.');
  }
};
