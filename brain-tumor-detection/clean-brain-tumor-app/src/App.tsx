import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header bg-primary text-white">
        <div className="container flex justify-between items-center">
          <h1>Brain Tumor Detection</h1>
          <nav>
            <ul className="nav-links">
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h2>Advanced Brain Tumor Detection with AI</h2>
            <p>Our cutting-edge technology helps medical professionals detect brain tumors with high accuracy.</p>
            <button className="btn">Learn More</button>
          </div>
          <div className="hero-image">
            <div className="brain-icon">🧠</div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="card max-w-md mx-auto">
            <h2>Welcome to Brain Tumor Detection App</h2>

            <p>
              This application uses advanced AI to detect brain tumors from MRI scans.
            </p>

            <div className="counter-container">
              <button
                onClick={() => setCount(count + 1)}
                className="btn"
              >
                Count: {count}
              </button>
            </div>

            <div className="info-box">
              <p>
                This is a demonstration of clean CSS working properly with React.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="text-center mb-8">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📤</div>
              <h3>Easy Upload</h3>
              <p>Simple interface for uploading MRI scans in various formats</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Accurate Analysis</h3>
              <p>Advanced AI model trained on thousands of MRI scans</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Storage</h3>
              <p>All patient data and scan results are securely stored</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} Brain Tumor Detection App</p>
        </div>
      </footer>
    </div>
  )
}

export default App
