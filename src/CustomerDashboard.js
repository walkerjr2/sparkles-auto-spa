import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch bookings for this user
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setBookings([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <button
          onClick={handleLogin}
          className="px-8 py-4 bg-sparkle-blue text-white font-bold rounded-full shadow-lg text-xl hover:bg-sparkle-blue-dark transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-sparkle-blue">Welcome, {user.displayName}</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full font-bold hover:bg-gray-300 transition-colors"
        >
          Log out
        </button>
      </div>
      <h3 className="text-xl font-bold mb-4 text-sparkle-blue">Your Recent Bookings</h3>
      {bookings.length === 0 ? (
        <div className="text-gray-500">No bookings found.</div>
      ) : (
        <ul className="space-y-4">
          {bookings.map(booking => (
            <li key={booking.id} className="bg-white rounded-xl shadow p-4 border border-sparkle-blue">
              <div className="font-bold text-lg text-sparkle-blue">{booking.service}</div>
              <div className="text-gray-700">Date: {booking.date || 'N/A'}</div>
              <div className="text-gray-700">Payment: {booking.paymentMethod || 'N/A'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
