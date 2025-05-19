import { useState } from 'react'

function TestApp() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '500px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: 'blue', textAlign: 'center' }}>
        Test Application
      </h1>
      
      <div style={{ 
        padding: '15px', 
        border: '1px solid #ccc', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <p>This is a minimal test application to verify React is working.</p>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Count: {count}
        </button>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px' 
      }}>
        <div style={{ 
          backgroundColor: '#e6ffe6', 
          padding: '10px', 
          borderRadius: '5px' 
        }}>
          <h2 style={{ color: 'green' }}>React</h2>
          <p>State management is working!</p>
        </div>
        
        <div style={{ 
          backgroundColor: '#e6e6ff', 
          padding: '10px', 
          borderRadius: '5px' 
        }}>
          <h2 style={{ color: 'purple' }}>Styling</h2>
          <p>Inline styles are working!</p>
        </div>
      </div>
    </div>
  )
}

export default TestApp
