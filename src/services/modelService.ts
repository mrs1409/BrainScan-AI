// This service handles the communication with the backend API that runs the PyTorch model

interface ModelResponse {
  hasTumor: boolean;
  confidence: number;
  tumorType?: string;
}

// When using Vite's proxy, we can use relative URLs for API calls
// This will be proxied to http://localhost:5001/api
// If proxy is not working, we can use the full URL
const API_BASE_URL = 'http://localhost:5001';

/**
 * Analyzes an MRI scan by sending it to the backend API
 * @param imageFile The MRI scan image file
 * @returns Analysis result from the model
 */
export const analyzeMRIScan = async (imageFile: File): Promise<ModelResponse> => {
  console.log(`Analyzing MRI scan: ${imageFile.name}, size: ${imageFile.size} bytes, type: ${imageFile.type}`);

  // Create a FormData object to send the file
  const formData = new FormData();

  // IMPORTANT: The key MUST be 'image' as that's what the backend expects
  formData.append('image', imageFile);

  // Log the FormData contents
  console.log('FormData contents:');
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1] instanceof File ? `File(${pair[1].name}, ${pair[1].size} bytes)` : pair[1]}`);
  }

  try {
    // First, test if the backend is responding at all
    console.log('Testing backend connection...');
    try {
      const testResponse = await fetch(`${API_BASE_URL}/api/test`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('Test endpoint response:', testData);
      } else {
        console.error('Test endpoint failed:', testResponse.status, testResponse.statusText);
      }
    } catch (testError) {
      console.error('Error testing backend connection:', testError);
    }

    // Use the /predict endpoint which is working in the reference implementation
    console.log('Sending request to /predict endpoint');
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
      // Disable caching to ensure fresh requests
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    console.log(`Response from /predict: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`);
    }

    // Parse the response
    const responseData = await response.json();
    console.log('Response data:', responseData);

    // Handle response from /predict endpoint (reference code format)
    if (responseData.success === true) {
      console.log('Received success response from /predict endpoint:', responseData);
      // Convert from reference code format to our format
      return {
        hasTumor: responseData.prediction === 'Tumor',
        confidence: responseData.confidence || 0.95, // Use provided confidence or default
        tumorType: responseData.prediction === 'Tumor' ? 'Glioblastoma' : undefined
      };
    } else if (responseData.success === false) {
      console.error('Received error response from /predict endpoint:', responseData);
      throw new Error(responseData.error || 'Analysis failed');
    }

    // If we get here, assume it's already in our format
    return responseData as ModelResponse;
  } catch (error) {
    console.error('Error analyzing MRI scan:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to analyze MRI scan. Please try again later.');
  }
};

/**
 * Checks if the backend model is loaded and ready
 * @returns True if the model is loaded and ready
 */
export const loadPyTorchModel = async (): Promise<boolean> => {
  try {
    console.log('Checking if PyTorch model is loaded...');

    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${API_BASE_URL}/api/health?_=${timestamp}`;

    console.log(`Making health check request to: ${url}`);

    const response = await fetch(url, {
      // Add cache busting to prevent cached responses
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    console.log(`Health check response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`Failed to check model status: ${response.status} ${response.statusText}`);
    }

    // Try to parse the response as JSON
    let data;
    try {
      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 200) + '...');

      // Check if the response is HTML (which would indicate a problem)
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html>')) {
        console.error('Received HTML response instead of JSON');
        return false;
      }

      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return false;
    }

    console.log('Health check response data:', data);

    // Check for model_loaded field first (direct field)
    if (data.model_loaded === true) {
      console.log('PyTorch model is loaded and ready (model_loaded field)');
      return true;
    }

    // Fallback to model_status.loaded if model_loaded is not present
    if (data.model_status && data.model_status.loaded === true) {
      console.log('PyTorch model is loaded and ready (model_status.loaded field)');
      return true;
    }

    console.warn('PyTorch model is not loaded. Some features may not work correctly.');
    if (data.model_status) {
      console.warn('Model status details:', data.model_status);
    }
    return false;
  } catch (error) {
    console.error('Error checking model status:', error);
    console.warn('Could not connect to the model backend. Using fallback mode.');
    return false;
  }
};
