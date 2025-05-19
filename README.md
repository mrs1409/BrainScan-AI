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

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/brain-tumor-detection.git
   cd brain-tumor-detection
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Enable Storage
   - Get your Firebase configuration
   - Create a `.env` file based on `.env.example` and update with your Firebase configuration:
     ```
     cp .env.example .env
     ```
     Then edit the `.env` file with your Firebase credentials.

4. Start the development server:
   ```
   npm run dev
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
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
│   ├── components/     # Reusable components
│   ├── context/        # React context providers
│   ├── pages/          # Application pages
│   ├── services/       # API and Firebase services
│   └── utils/          # Utility functions
├── backend/            # Flask API for model inference
│   ├── app.py          # Main Flask application
│   └── requirements.txt # Python dependencies
├── public/             # Public assets
└── ...                 # Configuration files
```

## Usage

1. Register for an account or log in with Google
2. Navigate to the Dashboard
3. Upload an MRI scan
4. View the analysis results
5. Check your scan history

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [PyTorch](https://pytorch.org/)
- [Flask](https://flask.palletsprojects.com/)
