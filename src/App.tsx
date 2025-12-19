import { useState } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string>('')
 
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log('Google credential:', credentialResponse.credential)
      
      // Send token to your backend
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log('Login successful:', data)
        setUser(data.user)
        // Store JWT token in localStorage
        localStorage.setItem('token', data.token)
        setError('')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to connect to server')
    }
  }

  const handleGoogleError = () => {
    console.log('Login Failed')
    setError('Google login failed')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <h1>Budget App</h1>
      
      <div className="card">
        {!user ? (
          <div>
            <h2>Login with Google</h2>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        ) : (
          <div>
            <h2>Welcome, {user.name}!</h2>
            <p>Email: {user.email}</p>
            <p>User ID: {user.id}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
        
        <hr style={{ margin: '2rem 0' }} />
        
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </GoogleOAuthProvider>
  )
}

export default App