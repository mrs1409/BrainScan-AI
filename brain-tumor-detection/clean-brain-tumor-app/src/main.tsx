import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

console.log('main.tsx is executing')

try {
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error('Root element not found!')
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found!</div>'
  } else {
    console.log('Root element found, rendering app')
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
