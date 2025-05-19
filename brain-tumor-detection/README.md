# Brain Tumor Detection Web Application

A web application for brain tumor detection using React, Tailwind CSS, Firebase, and a PyTorch model.

## Features

- User authentication with email/password and Google login
- MRI scan upload and analysis
- Visualization of detection results
- Patient history tracking
- Responsive design for all devices

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Authentication/Database**: Firebase (Auth, Firestore, Storage)
- **Model**: PyTorch (via Flask API)

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8+ (for the backend API)
- Firebase account

## Setup Instructions

### 1. Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Enable Storage
   - Get your Firebase configuration
   - Update the `.env` file with your Firebase configuration:
     ```
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```

3. Start the development server:
   ```
   npm run dev
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```
   python app.py
   ```

## Project Structure

```
brain-tumor-detection/
├── src/
│   ├── assets/         # Static assets
│   ├── components/     # Reusable components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Application pages
│   ├── services/       # API and Firebase services
│   └── utils/          # Utility functions
├── backend/            # Flask API for model inference
│   ├── app.py          # Main Flask application
│   └── requirements.txt # Python dependencies
├── model/              # PyTorch model files
│   └── model.pth       # Pre-trained model
├── public/             # Public assets
└── ...                 # Configuration files
```

## Usage

1. Register a new account or log in with existing credentials
2. Navigate to the Dashboard
3. Upload an MRI scan image
4. View the analysis results
5. Check your scan history in the History tab
