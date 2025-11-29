import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Filters
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Load logs from Firestore
  useEffect(() => {
    if (!authorized) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(logLimit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
      }));
      console.log('Loaded logs:', logsData.length);
      setLogs(logsData);
      setFilteredLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading logs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authorized, logLimit]);

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];

    // Filter by action type
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    // Filter by user email
    if (filterUser.trim()) {
      filtered = filtered.filter(log => 
        log.userEmail?.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    // Filter by date range
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      filtered = filtered.filter(log => log.timestamp >= fromDate);
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => log.timestamp <= toDate);
    }

    // Search in description or target name
    if (searchQuery.trim()) {
      filtered = filtered.filter(log =>
        log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filterAction, filterUser, filterDateFrom, filterDateTo, searchQuery]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'User Email', 'Action', 'Target', 'Description', 'IP Address', 'Browser Info'];
    const rows = filteredLogs.map(log => [
      log.timestamp.toLocaleString(),
      log.userEmail,
      log.action,
      log.targetName,
      log.description,
      log.ipAddress,
      log.browserInfo
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Action color and icon mapping
  const getActionStyle = (action) => {
    const styles = {
      CREATE_WORKER: { color: 'bg-green-100 text-green-800', icon: '➕', label: 'Created Worker' },
      UPDATE_WORKER: { color: 'bg-yellow-100 text-yellow-800', icon: '✏️', label: 'Updated Worker' },
      DELETE_WORKER: { color: 'bg-red-100 text-red-800', icon: '🗑️', label: 'Deleted Worker' },
      MIGRATE_WORKERS: { color: 'bg-blue-100 text-blue-800', icon: '🔄', label: 'Migrated Workers' },
      CREATE_BOOKING: { color: 'bg-green-100 text-green-800', icon: '📅', label: 'Created Booking' },
      UPDATE_BOOKING_STATUS: { color: 'bg-yellow-100 text-yellow-800', icon: '🔄', label: 'Updated Booking' },
      UPDATE_BOOKING_PRICE: { color: 'bg-orange-100 text-orange-800', icon: '💰', label: 'Updated Price' },
      DELETE_BOOKING: { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Deleted Booking' },
      ADMIN_LOGIN: { color: 'bg-blue-100 text-blue-800', icon: '🔓', label: 'Admin Login' },
      ADMIN_LOGOUT: { color: 'bg-gray-100 text-gray-800', icon: '🔒', label: 'Admin Logout' },
      LOGIN_FAILED: { color: 'bg-red-100 text-red-800', icon: '⚠️', label: 'Login Failed' },
    };
    return styles[action] || { color: 'bg-gray-100 text-gray-800', icon: '📝', label: action };
  };

  // Stats
  const stats = {
    total: filteredLogs.length,
    today: filteredLogs.filter(log => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return log.timestamp >= today;
    }).length,
    thisWeek: filteredLogs.filter(log => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return log.timestamp >= weekAgo;
    }).length,
    uniqueUsers: new Set(filteredLogs.map(log => log.userEmail)).size
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This page is restricted to super administrators only.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-sparkle-blue text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔍 Super Admin Audit Logs</h1>
              <p className="text-purple-200">Complete system activity monitoring</p>
              <p className="text-purple-300 text-sm mt-1">Logged in as: {currentUser?.email}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
              >
                🏠 Admin Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Activities</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            <div className="text-sm text-gray-600">Today</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">{stats.uniqueUsers}</div>
            <div className="text-sm text-gray-600">Unique Users</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔎 Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Action Type</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Actions</option>
                <option value="CREATE_WORKER">Create Worker</option>
                <option value="UPDATE_WORKER">Update Worker</option>
                <option value="DELETE_WORKER">Delete Worker</option>
                <option value="MIGRATE_WORKERS">Migrate Workers</option>
                <option value="CREATE_BOOKING">Create Booking</option>
                <option value="UPDATE_BOOKING_STATUS">Update Booking Status</option>
                <option value="UPDATE_BOOKING_PRICE">Update Price</option>
                <option value="ADMIN_LOGIN">Admin Login</option>
                <option value="ADMIN_LOGOUT">Admin Logout</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">User Email</label>
              <input
                type="text"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                placeholder="Filter by email..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Log Limit</label>
              <select
                value={logLimit}
                onChange={(e) => setLogLimit(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={500}>Last 500</option>
                <option value={1000}>Last 1000</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Log List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Activity Log ({filteredLogs.length})
            </h2>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activities found matching your filters
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const actionStyle = getActionStyle(log.action);
                return (
                  <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{actionStyle.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${actionStyle.color}`}>
                            {actionStyle.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {log.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-800 font-medium mb-2">{log.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div><strong>User:</strong> {log.userEmail}</div>
                          <div><strong>Target:</strong> {log.targetName}</div>
                          <div><strong>IP Address:</strong> {log.ipAddress}</div>
                          <div><strong>Browser:</strong> {log.browserInfo}</div>
                        </div>
                        {log.changes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Changes:</p>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-red-600 font-semibold mb-1">Before:</p>
                                <pre className="text-gray-700 whitespace-pre-wrap">{JSON.stringify(log.changes.before, null, 2)}</pre>
                              </div>
                              <div>
                                <p className="text-green-600 font-semibold mb-1">After:</p>
                                <pre className="text-gray-700 whitespace-pre-wrap">{JSON.stringify(log.changes.after, null, 2)}</pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
