import React, { useEffect, useState } from 'react';
import { collection, orderBy, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [priceEdits, setPriceEdits] = useState({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDcVN1C_ZFgn1smrKc5TyWQPraFZk4rJas',
  });

  // Real-time listener for all bookings
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString() || 'N/A'
      }));
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(b => b.date === filterDate);
    }

    setFilteredBookings(filtered);
  }, [filterStatus, filterDate, bookings]);

  // Update booking status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date()
      });
      alert(`Booking status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  // Update booking price
  const updateBookingPrice = async (bookingId, newPrice) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        price: Number(newPrice),
        updatedAt: new Date(),
      });
      alert('Price updated!');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    }
  };

  // Stats calculation
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  // Service pricing map (approximate starting prices)
  const servicePricing = {
    'Wash and Vac (Small Car)': 2000,
    'Wash and Vac (Sedan)': 2200,
    'Wash and Vac (Small SUV)': 2800,
    'Wash and Vac (Medium SUV)': 3000,
    'Wash and Vac (Large SUV)': 3500,
    'Wash and Vac (Small Bus)': 3500,
    'Wash and Vac (Large Bus)': 4500,
    'Wash and Vac (Extra Large Bus)': 5000,
    'Wash and Vac (Small Truck)': 6000,
    'Wash and Vac (Large Truck)': 7000,
    'Wash and Vac (Trailer Head)': 6000,
    'Wash and Vac (Trailer Front & Back)': 15000,
    'Wash and Vac (Dumper Truck)': 13000,
    'Wash and Vac (Tracker & Backhoe)': 15000,
    'Seat Only Detail': 15000,
    'Full Interior Detail': 25000,
    'Full Interior Detail (with seat removal)': 35000,
    'Headlight Restoration': 3000,
    'Plastic Restoration': 3000,
    'Buff and Polish': 30000,
    'Undercarriage Wash': 3000,
    'Engine Wash': 3000,
    'Leather Interior Detail': 10000,
    'Steam Cleaning Car Seat': 15000,
    'Steam Clean Sofa': 15000,
    'Wall Cleaning': 0, // Custom quote
    'Building Roof Cleaning': 15000,
    'Driveway Cleaning': 10000,
    'Carpet Cleaning': 5000,
    'Sofa Cleaning': 10000,
    'Mattress Cleaning': 10000,
  };

  // Monthly summary calculation
  const getMonthlySummary = () => {
    const [year, month] = selectedMonth.split('-');
    const monthlyBookings = bookings.filter(booking => {
      if (!booking.date) return false;
      const bookingDate = new Date(booking.date);
      return bookingDate.getFullYear() === parseInt(year) && 
             bookingDate.getMonth() + 1 === parseInt(month);
    });

    // Group by service
    const serviceStats = {};
    let totalRevenue = 0;

    monthlyBookings.forEach(booking => {
      const service = booking.service;
      if (!serviceStats[service]) {
        serviceStats[service] = {
          count: 0,
          revenue: 0,
          completed: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
        };
      }
      
      serviceStats[service].count++;
      serviceStats[service][booking.status || 'pending']++;
      
      // Calculate revenue (only for completed bookings)
      if (booking.status === 'completed') {
        const price = servicePricing[service] || 0;
        serviceStats[service].revenue += price;
        totalRevenue += price;
      }
    });

    return {
      bookings: monthlyBookings,
      serviceStats,
      totalRevenue,
      totalBookings: monthlyBookings.length,
      completedBookings: monthlyBookings.filter(b => b.status === 'completed').length,
    };
  };

  const monthlySummary = getMonthlySummary();

  const handleBack = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-sparkle-blue mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage all bookings in real-time</p>
            </div>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Monthly Summary Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowMonthlySummary(!showMonthlySummary)}
            className="w-full bg-gradient-to-r from-sparkle-blue to-blue-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2 text-sparkle-blue">📊 Monthly Summary & Revenue</h2>
                <p className="text-yellow-300 font-bold text-lg">Click to view detailed monthly statistics</p>
              </div>
              <span className="text-3xl">{showMonthlySummary ? '▼' : '▶'}</span>
            </div>
          </button>
        </div>

        {/* Monthly Summary Content */}
        {showMonthlySummary && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Monthly Report</h2>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sparkle-blue"
              />
            </div>
            {/* Monthly Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
                <div className="text-sm text-blue-800 font-bold mb-1">Total Revenue (Completed)</div>
                <div className="text-3xl font-bold text-blue-900">
                  ${monthlySummary.totalRevenue.toLocaleString()}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <div className="text-sm text-green-700 font-semibold mb-1">Total Bookings</div>
                <div className="text-3xl font-bold text-green-800">
                  {monthlySummary.totalBookings}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                <div className="text-sm text-purple-700 font-semibold mb-1">Completed Bookings</div>
                <div className="text-3xl font-bold text-purple-800">
                  {monthlySummary.completedBookings}
                </div>
              </div>
            </div>

            {/* Service Breakdown */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Service Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirmed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancelled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase font-bold">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(monthlySummary.serviceStats)
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .map(([service, stats]) => (
                      <tr key={service} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{service}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{stats.count}</td>
                        <td className="px-6 py-4 text-sm text-green-600 font-semibold">{stats.completed}</td>
                        <td className="px-6 py-4 text-sm text-yellow-600">{stats.pending}</td>
                        <td className="px-6 py-4 text-sm text-blue-600">{stats.confirmed}</td>
                        <td className="px-6 py-4 text-sm text-red-600">{stats.cancelled}</td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                            ${stats.revenue.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {Object.keys(monthlySummary.serviceStats).length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No bookings found for this month
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Revenue calculations are based on starting prices and only include completed bookings. 
                Actual revenue may vary based on vehicle size and additional services.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sparkle-blue"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sparkle-blue"
              />
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Bookings ({filteredBookings.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No bookings found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => {
                    // For price editing
                    const priceValue = priceEdits[booking.id] !== undefined ? priceEdits[booking.id] : (booking.price !== undefined ? booking.price : servicePricing[booking.service] || 0);
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800',
                      confirmed: 'bg-green-100 text-green-800',
                      completed: 'bg-blue-100 text-blue-800',
                      cancelled: 'bg-red-100 text-red-800'
                    };
                    
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{booking.name}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                          <div className="text-sm text-gray-500">{booking.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{booking.service}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{booking.vehicleSize || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{booking.date}</div>
                          <div className="text-sm text-gray-500">{booking.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{booking.location}</div>
                          {booking.lat && booking.lng && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowMapModal(true);
                              }}
                              className="text-xs text-sparkle-blue hover:underline mt-1 flex items-center gap-1"
                            >
                              📍 View on Map
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{booking.worker || 'Not Assigned'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            booking.paymentMethod === 'Cash' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.paymentMethod === 'Bank Transfer'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.paymentMethod || 'Not Selected'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              className="w-24 p-1 border border-gray-300 rounded text-sm"
                              value={priceValue}
                              onChange={e => setPriceEdits({ ...priceEdits, [booking.id]: e.target.value })}
                            />
                            <button
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                              onClick={() => updateBookingPrice(booking.id, priceEdits[booking.id] !== undefined ? priceEdits[booking.id] : priceValue)}
                              disabled={Number(priceValue) === Number(booking.price)}
                            >
                              Save
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status || 'pending']}`}>
                            {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {booking.status !== 'confirmed' && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                              >
                                ✓ Confirm
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                              >
                                ✓ Complete
                              </button>
                            )}
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                              >
                                ✗ Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Map Modal */}
        {showMapModal && selectedBooking && isLoaded && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-sparkle-blue">Booking Location</h3>
                  <p className="text-gray-600">{selectedBooking.name} - {selectedBooking.service}</p>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4 space-y-2">
                  <p className="text-sm text-gray-700"><strong>📅 Date & Time:</strong> {selectedBooking.date} at {selectedBooking.time}</p>
                  <p className="text-sm text-gray-700"><strong>📍 Address:</strong> {selectedBooking.location}</p>
                  <p className="text-sm text-gray-700"><strong>🗺️ Coordinates:</strong> {selectedBooking.lat}, {selectedBooking.lng}</p>
                  <p className="text-sm text-gray-700"><strong>🚗 Vehicle:</strong> {selectedBooking.vehicleSize || 'N/A'}</p>
                  <p className="text-sm text-gray-700"><strong>👤 Worker:</strong> {selectedBooking.worker || 'Not Assigned'}</p>
                  <p className="text-sm text-gray-700"><strong>💳 Payment Method:</strong> {selectedBooking.paymentMethod || 'Not Selected'}</p>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${selectedBooking.lat},${selectedBooking.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-blue-600 transition-colors mb-4"
                >
                  🗺️ Open in Google Maps
                </a>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '1rem' }}
                  center={{ lat: selectedBooking.lat, lng: selectedBooking.lng }}
                  zoom={15}
                >
                  <Marker position={{ lat: selectedBooking.lat, lng: selectedBooking.lng }} />
                </GoogleMap>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}