import React, { useEffect, useState } from 'react';
import { collection, orderBy, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { migrateWorkers } from './migrateWorkers';
import updateWorkerSchedules from './updateWorkerSchedules';
import { logActivity, ACTIVITY_TYPES, TARGET_TYPES } from './utils/activityLogger';

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
  
  // Worker management states
  const [workers, setWorkers] = useState([]);
  const [showWorkerManagement, setShowWorkerManagement] = useState(false);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [workerForm, setWorkerForm] = useState({
    name: '',
    bio: '',
    imageUrl: '',
    start: '06:30',
    end: '14:00',
    interval: 90,
    dayOff: 1,
    overrides: null,
    lastSlotInclusive: false,
    customSlots: null,
    active: true,
    order: 0
  });

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

  // Real-time listener for workers
  useEffect(() => {
    console.log('Setting up workers listener...');
    
    // Try without ordering first to avoid index issues
    const q = collection(db, 'workers');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Workers snapshot received, docs count:', snapshot.docs.length);
      const workersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort manually by order field
      workersData.sort((a, b) => (a.order || 0) - (b.order || 0));
      console.log('Workers loaded from Firestore:', workersData);
      setWorkers(workersData);
    }, (error) => {
      console.error('Error loading workers:', error);
      console.log('This is normal if workers collection does not exist yet. Click "Migrate Workers" button to create it.');
      setWorkers([]);
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
      const booking = bookings.find(b => b.id === bookingId);
      const oldStatus = booking?.status || 'pending';
      
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Log the activity
      await logActivity({
        userEmail: auth.currentUser?.email || 'Unknown',
        action: ACTIVITY_TYPES.UPDATE_BOOKING_STATUS,
        targetType: TARGET_TYPES.BOOKING,
        targetName: `Booking #${bookingId.slice(-6)} - ${booking?.name || 'Unknown'}`,
        changes: {
          before: { status: oldStatus },
          after: { status: newStatus }
        },
        description: `Changed booking status from ${oldStatus} to ${newStatus} for ${booking?.name || 'Unknown'}`
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
      const booking = bookings.find(b => b.id === bookingId);
      const oldPrice = booking?.price || 0;
      
      await updateDoc(doc(db, 'bookings', bookingId), {
        price: Number(newPrice),
        updatedAt: new Date(),
      });
      
      // Log the activity
      await logActivity({
        userEmail: auth.currentUser?.email || 'Unknown',
        action: ACTIVITY_TYPES.UPDATE_BOOKING_PRICE,
        targetType: TARGET_TYPES.PRICE,
        targetName: `Booking #${bookingId.slice(-6)} - ${booking?.name || 'Unknown'}`,
        changes: {
          before: { price: oldPrice },
          after: { price: Number(newPrice) }
        },
        description: `Updated price from $${oldPrice} to $${newPrice} for ${booking?.name || 'Unknown'}`
      });
      
      alert('Price updated!');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    }
  };

  // Worker CRUD operations
  const handleAddWorker = async () => {
    try {
      const workerData = {
        ...workerForm,
        interval: Number(workerForm.interval),
        dayOff: Number(workerForm.dayOff),
        order: Number(workerForm.order)
      };
      
      await addDoc(collection(db, 'workers'), workerData);
      
      // Log the activity
      await logActivity({
        userEmail: auth.currentUser?.email || 'Unknown',
        action: ACTIVITY_TYPES.CREATE_WORKER,
        targetType: TARGET_TYPES.WORKER,
        targetName: workerForm.name,
        changes: {
          before: null,
          after: workerData
        },
        description: `Created new worker: ${workerForm.name} with schedule ${workerForm.start}-${workerForm.end}`
      });
      
      alert('Worker added successfully!');
      resetWorkerForm();
      setShowWorkerForm(false);
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Failed to add worker: ' + error.message);
    }
  };

  const handleUpdateWorker = async () => {
    try {
      const updatedData = {
        ...workerForm,
        interval: Number(workerForm.interval),
        dayOff: Number(workerForm.dayOff),
        order: Number(workerForm.order)
      };
      
      await updateDoc(doc(db, 'workers', editingWorker.id), updatedData);
      
      // Log the activity
      await logActivity({
        userEmail: auth.currentUser?.email || 'Unknown',
        action: ACTIVITY_TYPES.UPDATE_WORKER,
        targetType: TARGET_TYPES.WORKER,
        targetName: workerForm.name,
        changes: {
          before: editingWorker,
          after: updatedData
        },
        description: `Updated worker: ${workerForm.name}`
      });
      
      alert('Worker updated successfully!');
      resetWorkerForm();
      setShowWorkerForm(false);
      setEditingWorker(null);
    } catch (error) {
      console.error('Error updating worker:', error);
      alert('Failed to update worker: ' + error.message);
    }
  };

  const handleDeleteWorker = async (workerId, workerName) => {
    if (window.confirm(`Are you sure you want to delete ${workerName}? This action cannot be undone.`)) {
      try {
        // Find the worker data before deleting
        const workerToDelete = workers.find(w => w.id === workerId);
        
        await deleteDoc(doc(db, 'workers', workerId));
        
        // Log the activity
        await logActivity({
          userEmail: auth.currentUser?.email || 'Unknown',
          action: ACTIVITY_TYPES.DELETE_WORKER,
          targetType: TARGET_TYPES.WORKER,
          targetName: workerName,
          changes: {
            before: workerToDelete,
            after: null
          },
          description: `Deleted worker: ${workerName}`
        });
        
        alert('Worker deleted successfully!');
      } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Failed to delete worker: ' + error.message);
      }
    }
  };

  const handleEditWorker = (worker) => {
    setEditingWorker(worker);
    setWorkerForm({
      name: worker.name,
      bio: worker.bio || '',
      imageUrl: worker.imageUrl || '',
      start: worker.start,
      end: worker.end,
      interval: worker.interval,
      dayOff: worker.dayOff,
      overrides: worker.overrides || null,
      lastSlotInclusive: worker.lastSlotInclusive || false,
      customSlots: worker.customSlots || null,
      active: worker.active !== undefined ? worker.active : true,
      order: worker.order || 0
    });
    setShowWorkerForm(true);
  };

  const resetWorkerForm = () => {
    setWorkerForm({
      name: '',
      bio: '',
      imageUrl: '',
      start: '06:30',
      end: '14:00',
      interval: 90,
      dayOff: 1,
      overrides: null,
      lastSlotInclusive: false,
      customSlots: null,
      active: true,
      order: workers.length
    });
  };

  const handleMigrateWorkers = async () => {
    if (workers.length > 0) {
      if (!window.confirm('Workers already exist. This will add duplicate workers. Continue?')) {
        return;
      }
    }
    const result = await migrateWorkers();
    if (result.success) {
      // Log the migration
      await logActivity({
        userEmail: auth.currentUser?.email || 'Unknown',
        action: ACTIVITY_TYPES.MIGRATE_WORKERS,
        targetType: TARGET_TYPES.WORKER,
        targetName: 'Initial Workers (Nick, Ricardo, Radcliffe)',
        changes: null,
        description: `Migrated initial workers from code to Firestore database`
      });
      alert('Workers migrated successfully!');
    } else {
      alert('Migration failed: ' + result.error);
    }
  };

  const handleUpdateSchedules = async () => {
    if (window.confirm('Update Nick and Ricardo to new custom time slots?')) {
      const result = await updateWorkerSchedules();
      if (result.success) {
        alert('✅ Schedules updated!\n\nNick: 6:30am, 8:00am, 9:30am, 11:00am, 12:30pm, 2:00pm\nRicardo: 6:30am, 8:30am, 10:30am, 12:30pm, 2:30pm, 4:30pm');
      } else {
        alert('Failed to update schedules: ' + result.error);
      }
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-sparkle-blue mb-1 sm:mb-2">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage all bookings in real-time</p>
            </div>
            <button
              onClick={handleBack}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl shadow p-3 sm:p-4 border-l-4 border-blue-500">
            <div className="text-xl sm:text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl shadow p-3 sm:p-4 border-l-4 border-yellow-500">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs sm:text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow p-3 sm:p-4 border-l-4 border-green-500">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-xs sm:text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-xl shadow p-3 sm:p-4 border-l-4 border-blue-400">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-xs sm:text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow p-3 sm:p-4 border-l-4 border-red-500 col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-xs sm:text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Monthly Summary Toggle */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => setShowMonthlySummary(!showMonthlySummary)}
            className="w-full bg-gradient-to-r from-sparkle-blue to-blue-600 text-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-center gap-2">
              <div className="text-left flex-1">
                <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 text-white">📊 Monthly Summary</h2>
                <p className="text-yellow-300 font-bold text-xs sm:text-lg">View monthly statistics</p>
              </div>
              <span className="text-2xl sm:text-3xl flex-shrink-0">{showMonthlySummary ? '▼' : '▶'}</span>
            </div>
          </button>
        </div>

        {/* Monthly Summary Content */}
        {showMonthlySummary && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Monthly Report</h2>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sparkle-blue text-sm sm:text-base"
              />
            </div>
            {/* Monthly Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border-2 border-blue-300">
                <div className="text-xs sm:text-sm text-blue-800 font-bold mb-1">Total Revenue (Completed)</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900">
                  ${monthlySummary.totalRevenue.toLocaleString()}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border-2 border-green-200">
                <div className="text-xs sm:text-sm text-green-700 font-semibold mb-1">Total Bookings</div>
                <div className="text-2xl sm:text-3xl font-bold text-green-800">
                  {monthlySummary.totalBookings}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border-2 border-purple-200 sm:col-span-2 md:col-span-1">
                <div className="text-xs sm:text-sm text-purple-700 font-semibold mb-1">Completed Bookings</div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-800">
                  {monthlySummary.completedBookings}
                </div>
              </div>
            </div>

            {/* Service Breakdown */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Service Breakdown</h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirmed</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancelled</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-600 uppercase font-bold">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(monthlySummary.serviceStats)
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .map(([service, stats]) => (
                      <tr key={service} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">{service}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{stats.count}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-green-600 font-semibold">{stats.completed}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-yellow-600">{stats.pending}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-blue-600">{stats.confirmed}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-red-600">{stats.cancelled}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className="text-sm sm:text-lg font-bold text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-lg">
                            ${stats.revenue.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {Object.keys(monthlySummary.serviceStats).length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                        No bookings found for this month
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Note:</strong> Revenue calculations are based on starting prices and only include completed bookings. 
                Actual revenue may vary based on vehicle size and additional services.
              </p>
            </div>
          </div>
        )}

        {/* Worker Management Toggle */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => setShowWorkerManagement(!showWorkerManagement)}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-center gap-2">
              <div className="text-left flex-1">
                <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">👷 Worker Management</h2>
                <p className="text-purple-200 font-bold text-xs sm:text-lg">Manage employees & schedules</p>
              </div>
              <span className="text-2xl sm:text-3xl flex-shrink-0">{showWorkerManagement ? '▼' : '▶'}</span>
            </div>
          </button>
        </div>

        {/* Worker Management Content */}
        {showWorkerManagement && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Manage Workers</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {workers.length === 0 && (
                  <button
                    onClick={handleMigrateWorkers}
                    className="px-3 sm:px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors text-sm sm:text-base whitespace-nowrap"
                  >
                    🔄 Migrate Workers
                  </button>
                )}
                <button
                  onClick={() => {
                    resetWorkerForm();
                    setEditingWorker(null);
                    setShowWorkerForm(!showWorkerForm);
                  }}
                  className="px-3 sm:px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                >
                  {showWorkerForm ? '✕ Cancel' : '➕ Add Worker'}
                </button>
              </div>
            </div>

            {/* Worker Form */}
            {showWorkerForm && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {editingWorker ? 'Edit Worker' : 'Add New Worker'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={workerForm.name}
                      onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                      placeholder="Worker name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={workerForm.imageUrl}
                      onChange={(e) => setWorkerForm({ ...workerForm, imageUrl: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={workerForm.bio}
                      onChange={(e) => setWorkerForm({ ...workerForm, bio: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                      placeholder="Short bio about the worker"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="time"
                      value={workerForm.start}
                      onChange={(e) => setWorkerForm({ ...workerForm, start: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time *</label>
                    <input
                      type="time"
                      value={workerForm.end}
                      onChange={(e) => setWorkerForm({ ...workerForm, end: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot Interval (minutes) *</label>
                    <input
                      type="number"
                      value={workerForm.interval}
                      onChange={(e) => setWorkerForm({ ...workerForm, interval: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                      placeholder="90"
                      min="15"
                      step="15"
                    />
                    <p className="text-xs text-gray-500 mt-1">Booking slots will be created every X minutes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Day Off *</label>
                    <select
                      value={workerForm.dayOff}
                      onChange={(e) => setWorkerForm({ ...workerForm, dayOff: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={workerForm.order}
                      onChange={(e) => setWorkerForm({ ...workerForm, order: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={workerForm.active}
                      onChange={(e) => setWorkerForm({ ...workerForm, active: e.target.value === 'true' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Include Last Slot</label>
                    <select
                      value={workerForm.lastSlotInclusive}
                      onChange={(e) => setWorkerForm({ ...workerForm, lastSlotInclusive: e.target.value === 'true' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Allow booking to start at end time</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={editingWorker ? handleUpdateWorker : handleAddWorker}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingWorker ? '💾 Update Worker' : '➕ Add Worker'}
                  </button>
                  <button
                    onClick={() => {
                      setShowWorkerForm(false);
                      setEditingWorker(null);
                      resetWorkerForm();
                    }}
                    className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Workers List */}
            <div className="space-y-4">
              {workers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No workers found</p>
                  <p className="text-gray-400 text-sm">Click "Migrate Workers" above to add the initial workers, or "Add Worker" to create a new one.</p>
                </div>
              ) : (
                workers.map((worker) => (
                  <div
                    key={worker.id}
                    className={`border-2 rounded-xl p-4 sm:p-6 transition-all ${
                      worker.active ? 'border-purple-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-3 sm:gap-4">
                        {worker.imageUrl && (
                          <img
                            src={worker.imageUrl}
                            alt={worker.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">{worker.name}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              worker.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {worker.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {worker.bio && <p className="text-gray-600 text-xs sm:text-sm mb-3">{worker.bio}</p>}
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div>
                              <span className="text-gray-500 font-semibold">Hours:</span>
                              <p className="text-gray-800">{worker.start} - {worker.end}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-semibold">Interval:</span>
                              <p className="text-gray-800">{worker.interval} min</p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-semibold">Day Off:</span>
                              <p className="text-gray-800">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][worker.dayOff]}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-semibold">Order:</span>
                              <p className="text-gray-800">#{worker.order}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditWorker(worker)}
                          className="flex-1 px-3 sm:px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWorker(worker.id, worker.name)}
                          className="flex-1 px-3 sm:px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sparkle-blue text-sm sm:text-base"
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
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sparkle-blue text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Bookings Table/Cards */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Bookings ({filteredBookings.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No bookings found</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
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

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const priceValue = priceEdits[booking.id] !== undefined ? priceEdits[booking.id] : (booking.price !== undefined ? booking.price : servicePricing[booking.service] || 0);
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    confirmed: 'bg-green-100 text-green-800',
                    completed: 'bg-blue-100 text-blue-800',
                    cancelled: 'bg-red-100 text-red-800'
                  };
                  
                  return (
                    <div key={booking.id} className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{booking.name}</h3>
                          <p className="text-xs text-gray-500">{booking.email}</p>
                          <p className="text-xs text-gray-500">{booking.phone}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status || 'pending']}`}>
                          {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                        </span>
                      </div>

                      {/* Service Info */}
                      <div className="text-sm space-y-1">
                        <p><strong>Service:</strong> {booking.service}</p>
                        <p><strong>Vehicle:</strong> {booking.vehicleSize || 'N/A'}</p>
                        <p><strong>Date:</strong> {booking.date} at {booking.time}</p>
                        <p><strong>Worker:</strong> {booking.worker || 'Not Assigned'}</p>
                        <div className="flex items-center justify-between">
                          <strong>Location:</strong>
                          {booking.lat && booking.lng && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowMapModal(true);
                              }}
                              className="text-xs text-sparkle-blue hover:underline"
                            >
                              📍 View Map
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{booking.location}</p>
                      </div>

                      {/* Payment & Price */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.paymentMethod === 'Cash' 
                            ? 'bg-green-100 text-green-800' 
                            : booking.paymentMethod === 'Bank Transfer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.paymentMethod || 'No Payment'}
                        </span>
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="number"
                            min="0"
                            className="flex-1 min-w-0 p-1 border border-gray-300 rounded text-sm"
                            value={priceValue}
                            onChange={e => setPriceEdits({ ...priceEdits, [booking.id]: e.target.value })}
                          />
                          <button
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            onClick={() => updateBookingPrice(booking.id, priceEdits[booking.id] !== undefined ? priceEdits[booking.id] : priceValue)}
                            disabled={Number(priceValue) === Number(booking.price)}
                          >
                            $
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {booking.status !== 'confirmed' && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
                          >
                            ✓ Confirm
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="flex-1 text-xs bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                          >
                            ✓ Complete
                          </button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="flex-1 text-xs bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors"
                          >
                            ✗ Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
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