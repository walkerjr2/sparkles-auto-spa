import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      setError(err.message || 'Invalid credentials');
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
        className="w-full py-3 rounded-xl bg-sparkle-blue text-white font-bold text-xl shadow-lg hover:bg-sparkle-blue-dark transition-colors border-2 border-sparkle-blue mt-2"
        style={{ letterSpacing: '1px' }}
      >
        Login
      </button>
      {error && (
        <div className="w-full text-center text-red-600 bg-red-50 border border-red-200 rounded-xl py-2 px-3 mt-2 text-base font-medium shadow-sm">
          {error}
        </div>
      )}
    </form>
  );
}