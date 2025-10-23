import React, { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export default function AdminPage() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setAdminLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

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
