import React, { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export default function AdminPage() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setAdminLoggedIn(!!user);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sparkle-blue via-sparkle-green to-yellow-300">
        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sparkle-blue mx-auto mb-4"></div>
          <p className="text-sparkle-blue font-semibold text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (adminLoggedIn) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sparkle-blue via-sparkle-green to-yellow-300">
      <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 max-w-md w-full relative">
        <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
      </div>
    </div>
  );
}
