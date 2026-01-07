import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError('No credential received');
      return;
    }

    setError('');

    try {
      // Send Google ID token to backend to verify and get app JWT (cookie)
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: allows backend to set httpOnly cookie
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Login failed');
        return;
      }

      const data = await res.json();
      // Backend set httpOnly cookie; call onLogin with user info
      onLogin(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <TrendingUp className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
            <p className="text-gray-600">Manage your finances with ease</p>
          </div>

          <div className="w-full flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
