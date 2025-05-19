import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('main.tsx is executing with App component')

try {
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error('Root element not found!')
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found!</div>'
  } else {
    console.log('Root element found, rendering App')
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  }
} catch (error) {
  console.error('Error rendering app:', error)
  document.body.innerHTML = `<div style="color: red; padding: 20px;">Error: ${error instanceof Error ? error.message : String(error)}</div>`
}
