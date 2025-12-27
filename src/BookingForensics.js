import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function BookingForensics() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [logLimit, setLogLimit] = useState(100);
  
  const navigate = useNavigate();
  
  const SUPER_ADMIN_EMAIL = 'jrcosroy.walker@gmail.com';

  // Check authorization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email === SUPER_ADMIN_EMAIL) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch logs
  useEffect(() => {
    if (!authorized) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'booking_attempts'),
      orderBy('timestamp', 'desc'),
      limit(logLimit)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().timestampISO)
      }));
      setLogs(logsData);
      setFilteredLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching logs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authorized, logLimit]);

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.status === filterStatus);
    }

    // Filter by date
    const now = new Date();
    if (filterDate === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      filtered = filtered.filter(log => log.timestamp >= todayStart);
    } else if (filterDate === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => log.timestamp >= weekAgo);
    } else if (filterDate === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => log.timestamp >= monthAgo);
    }

    // Search by email (partial match on obfuscated email)
    if (searchEmail) {
      filtered = filtered.filter(log => 
        log.bookingDetails?.email?.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    // Search by phone (last 4 digits)
    if (searchPhone) {
      filtered = filtered.filter(log => 
        log.bookingDetails?.phone?.includes(searchPhone)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filterStatus, filterDate, searchEmail, searchPhone]);

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      'BUTTON_CLICKED': 'bg-blue-100 text-blue-800',
      'VALIDATION_FAILED': 'bg-yellow-100 text-yellow-800',
      'FIREBASE_STARTED': 'bg-purple-100 text-purple-800',
      'FIREBASE_SUCCESS': 'bg-green-100 text-green-800',
      'FIREBASE_FAILED': 'bg-red-100 text-red-800',
      'EMAIL_STARTED': 'bg-indigo-100 text-indigo-800',
      'EMAIL_SUCCESS': 'bg-green-100 text-green-800',
      'EMAIL_FAILED': 'bg-orange-100 text-orange-800',
      'BOOKING_COMPLETE': 'bg-emerald-100 text-emerald-800',
      'USER_CANCELLED': 'bg-gray-100 text-gray-800',
      'ERROR': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get success/failure stats
  const getStats = () => {
    const total = filteredLogs.length;
    const completed = filteredLogs.filter(l => l.status === 'BOOKING_COMPLETE').length;
    const failed = filteredLogs.filter(l => 
      l.status === 'FIREBASE_FAILED' || 
      l.status === 'EMAIL_FAILED' || 
      l.status === 'VALIDATION_FAILED' ||
      l.status === 'ERROR'
    ).length;
    const buttonClicks = filteredLogs.filter(l => l.status === 'BUTTON_CLICKED').length;
    
    return { total, completed, failed, buttonClicks };
  };

  const stats = getStats();

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Status', 'Email', 'Phone', 'Service', 'Date', 'Time', 'IP', 'Browser', 'Device', 'Error'];
    const rows = filteredLogs.map(log => [
      log.timestamp.toLocaleString(),
      log.status,
      log.bookingDetails?.email || '',
      log.bookingDetails?.phone || '',
      log.bookingDetails?.service || '',
      log.bookingDetails?.date || '',
      log.bookingDetails?.time || '',
      log.ipAddress || '',
      log.browser || '',
      log.deviceType || '',
      log.error || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-forensics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">🔍 Loading forensic data...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-2xl">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            This forensic logging system is restricted to super admin only.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                🔬 Booking Forensics Lab
              </h1>
              <p className="text-gray-600 mt-1">
                Super detailed logging of EVERY booking attempt
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🏠 Home
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="text-2xl font-bold text-yellow-600">{stats.buttonClicks}</div>
              <div className="text-sm text-gray-600">Button Clicks</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🔍 Filters</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="BUTTON_CLICKED">Button Clicked</option>
                <option value="VALIDATION_FAILED">Validation Failed</option>
                <option value="FIREBASE_SUCCESS">Firebase Success</option>
                <option value="FIREBASE_FAILED">Firebase Failed</option>
                <option value="EMAIL_SUCCESS">Email Success</option>
                <option value="EMAIL_FAILED">Email Failed</option>
                <option value="BOOKING_COMPLETE">Booking Complete</option>
                <option value="ERROR">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Email</label>
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Phone</label>
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Last 4 digits..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
              <select
                value={logLimit}
                onChange={(e) => setLogLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="50">Last 50</option>
                <option value="100">Last 100</option>
                <option value="500">Last 500</option>
                <option value="1000">Last 1000</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device/Browser</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network/Performance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Analytics</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No booking attempts found matching filters
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>{log.timestamp.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(log.status)}`}>
                          {log.status.replace(/_/g, ' ')}
                        </span>
                        {log.fraudAnalysis && log.fraudAnalysis.fraudScore > 0.5 && (
                          <div className="mt-1">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                              🚨 Fraud: {(log.fraudAnalysis.fraudScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{log.bookingDetails?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{log.bookingDetails?.email || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{log.bookingDetails?.phone || 'N/A'}</div>
                        {log.customerHistory?.isReturningCustomer && (
                          <div className="mt-1">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                              🔄 Returning ({log.customerHistory.previousBookings})
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{log.bookingDetails?.service || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{log.bookingDetails?.vehicleSize || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {log.bookingDetails?.date || 'N/A'} at {log.bookingDetails?.time || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{log.bookingDetails?.location || 'N/A'}</div>
                        {log.formInteractions && (
                          <div className="text-xs text-purple-600 mt-1">
                            ⏱️ {log.formInteractions.totalTimeOnForm} | 
                            👆 {log.formInteractions.clicksBeforeSubmit} clicks
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{log.deviceType || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{log.browser || 'N/A'} {log.browserVersion || ''}</div>
                        <div className="text-xs text-gray-500">{log.os || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{log.viewportSize || 'N/A'}</div>
                        {log.vpnDetected && (
                          <div className="mt-1">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">
                              🔒 VPN
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="text-xs text-gray-900 font-medium">
                          📡 {log.network?.effectiveType || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.ipLocation?.city}, {log.ipLocation?.country || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">IP: {log.ipAddress || 'N/A'}</div>
                        {log.apiResponseTimes && (
                          <div className="text-xs text-green-600 mt-1">
                            ⚡ Firebase: {log.apiResponseTimes.firebase}<br/>
                            📧 Email: {log.apiResponseTimes.emailjs}
                          </div>
                        )}
                        {log.performance && (
                          <div className="text-xs text-blue-600">
                            ⏱️ Load: {log.performance.pageLoadTime}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.intentAnalysis && (
                          <div className="mb-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              log.intentAnalysis.intentLevel === 'High' ? 'bg-green-100 text-green-800' :
                              log.intentAnalysis.intentLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              🎯 Intent: {log.intentAnalysis.intentLevel}
                            </span>
                          </div>
                        )}
                        {log.formInteractions && (
                          <div className="text-xs text-gray-600">
                            ✅ {log.formInteractions.fieldsCompleted?.length || 0} fields<br/>
                            ❌ {log.formInteractions.fieldsEmpty?.length || 0} empty
                          </div>
                        )}
                        {log.sessionDuration && (
                          <div className="text-xs text-gray-500">
                            ⏰ Session: {log.sessionDuration}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.error ? (
                          <div>
                            <div className="text-xs text-red-600 font-medium max-w-xs truncate" title={log.error.message || log.error}>
                              {log.error.message || log.error}
                            </div>
                            {log.error.suggestedFix && (
                              <div className="text-xs text-orange-600 mt-1">
                                💡 {log.error.suggestedFix}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 rounded-lg p-4 mt-6 border-l-4 border-yellow-400">
          <h3 className="font-bold text-yellow-800 mb-2">🔍 How to Use This</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>BUTTON_CLICKED</strong> = User pressed submit (proves they tried)</li>
            <li>• <strong>VALIDATION_FAILED</strong> = Form had errors (shows what was missing)</li>
            <li>• <strong>FIREBASE_SUCCESS</strong> = Booking saved to database</li>
            <li>• <strong>EMAIL_SUCCESS</strong> = Confirmation emails sent</li>
            <li>• <strong>BOOKING_COMPLETE</strong> = Everything worked perfectly</li>
            <li>• Check email/phone to find specific customers claiming they booked</li>
            <li>• If no log exists, they never pressed the button (they're lying)</li>
            <li>• If log shows VALIDATION_FAILED, they had form errors (their fault)</li>
            <li>• If log shows ERROR, something broke on your end (your fault)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
