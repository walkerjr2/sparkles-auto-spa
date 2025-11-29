import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onLogin will be called by onAuthStateChanged in AdminPage
      if (onLogin) onLogin();
    } catch (err) {
      console.error('Admin login error:', err);
      
      // Better error messages
      let errorMessage = 'Invalid credentials';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No admin account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Try again later';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your internet connection';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 items-center justify-center w-full"
      style={{ maxWidth: 400, margin: '2rem auto' }}
    >
      <h2 className="text-3xl font-extrabold text-sparkle-blue mb-2 tracking-wide drop-shadow">Admin Login</h2>
      <div className="w-full flex flex-col gap-4">
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-sparkle-blue focus:outline-none focus:ring-2 focus:ring-sparkle-blue bg-gray-50 text-lg shadow"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-sparkle-blue focus:outline-none focus:ring-2 focus:ring-sparkle-blue bg-gray-50 text-lg shadow"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl bg-sparkle-blue text-white font-bold text-xl shadow-lg transition-colors border-2 border-sparkle-blue mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sparkle-blue-dark'}`}
        style={{ letterSpacing: '1px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Logging in...
          </div>
        ) : (
          'Login'
        )}
      </button>
      {error && (
        <div className="w-full text-center text-red-600 bg-red-50 border border-red-200 rounded-xl py-2 px-3 mt-2 text-base font-medium shadow-sm">
          {error}
        </div>
      )}
    </form>
  );
}