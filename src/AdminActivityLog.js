import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Filters
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [searchAdmin, setSearchAdmin] = useState('');
  const [searchResource, setSearchResource] = useState('');
  const [filterResourceType, setFilterResourceType] = useState('all');
  const [logLimit, setLogLimit] = useState(100);
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  
  // Detail view
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
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

  // Fetch audit logs
  useEffect(() => {
    if (!authorized) return;

    const q = query(
      collection(db, 'admin_audit_log'),
      orderBy('timestamp', 'desc'),
      limit(logLimit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      setLogs(logsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authorized, logLimit]);

  // Apply filters
  useEffect(() => {
    let filtered = logs;

    // Filter by action type
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    // Filter by resource type
    if (filterResourceType !== 'all') {
      filtered = filtered.filter(log => log.resourceType === filterResourceType);
    }

    // Filter by date
    if (filterDate === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(log => log.timestamp.toDateString() === today);
    } else if (filterDate === 'yesterday') {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      filtered = filtered.filter(log => log.timestamp.toDateString() === yesterday);
    } else if (filterDate === 'week') {
      const weekAgo = Date.now() - 7 * 86400000;
      filtered = filtered.filter(log => log.timestamp.getTime() > weekAgo);
    } else if (filterDate === 'month') {
      const monthAgo = Date.now() - 30 * 86400000;
      filtered = filtered.filter(log => log.timestamp.getTime() > monthAgo);
    } else if (filterDate === 'custom' && customDateStart && customDateEnd) {
      const start = new Date(customDateStart).setHours(0, 0, 0, 0);
      const end = new Date(customDateEnd).setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => {
        const logTime = log.timestamp.getTime();
        return logTime >= start && logTime <= end;
      });
    }

    // Search by admin email
    if (searchAdmin) {
      filtered = filtered.filter(log =>
        log.adminEmail?.toLowerCase().includes(searchAdmin.toLowerCase())
      );
    }

    // Search by resource name
    if (searchResource) {
      filtered = filtered.filter(log =>
        log.resourceName?.toLowerCase().includes(searchResource.toLowerCase()) ||
        log.resourceId?.toLowerCase().includes(searchResource.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filterAction, filterResourceType, filterDate, searchAdmin, searchResource, customDateStart, customDateEnd]);

  // Get action badge color
  const getActionColor = (action) => {
    if (action.includes('CREATED') || action.includes('LOGIN')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATED') || action.includes('SCHEDULE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETED') || action.includes('LOGOUT')) return 'bg-red-100 text-red-800';
    if (action.includes('STATUS')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('EXPORT')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Get resource type icon
  const getResourceIcon = (type) => {
    if (type === 'driver') return '👨‍🔧';
    if (type === 'booking') return '📅';
    if (type === 'user') return '👤';
    if (type === 'settings') return '⚙️';
    if (type === 'data') return '📊';
    return '📝';
  };

  // Get stats
  const getStats = () => {
    const totalLogs = filteredLogs.length;
    const uniqueAdmins = new Set(filteredLogs.map(log => log.adminEmail)).size;
    const driverChanges = filteredLogs.filter(log => log.resourceType === 'driver').length;
    const bookingChanges = filteredLogs.filter(log => log.resourceType === 'booking').length;
    
    return { totalLogs, uniqueAdmins, driverChanges, bookingChanges };
  };

  const stats = getStats();

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Admin', 'Action', 'Resource Type', 'Resource Name', 'Changes', 'IP Address', 'Browser'];
    const rows = filteredLogs.map(log => [
      log.timestamp.toLocaleString(),
      log.adminEmail,
      log.actionLabel,
      log.resourceType,
      log.resourceName,
      log.changesMade?.summary || 'N/A',
      log.ipAddress,
      log.browser
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading audit logs...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">🔒 Unauthorized</h1>
          <p className="text-xl mb-6">You don't have permission to view this page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white text-red-900 rounded-lg font-semibold hover:bg-gray-100"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                🔍 Admin Activity Log
              </h1>
              <p className="text-gray-600 mt-1">Complete audit trail of all administrative actions</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-semibold">Total Actions</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.totalLogs}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-semibold">Unique Admins</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.uniqueAdmins}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-semibold">Driver Changes</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">{stats.driverChanges}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-gray-600 text-sm font-semibold">Booking Changes</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">{stats.bookingChanges}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔎 Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {filterDate === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customDateStart}
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customDateEnd}
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}

            {/* Action Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Actions</option>
                <option value="DRIVER_CREATED">Driver Created</option>
                <option value="DRIVER_UPDATED">Driver Updated</option>
                <option value="DRIVER_DELETED">Driver Deleted</option>
                <option value="DRIVER_SCHEDULE_UPDATED">Schedule Updated</option>
                <option value="BOOKING_UPDATED">Booking Updated</option>
                <option value="BOOKING_STATUS_CHANGED">Booking Status Changed</option>
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
              <select
                value={filterResourceType}
                onChange={(e) => setFilterResourceType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="driver">👨‍🔧 Drivers</option>
                <option value="booking">📅 Bookings</option>
                <option value="user">👤 Users</option>
                <option value="settings">⚙️ Settings</option>
              </select>
            </div>

            {/* Admin Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Admin</label>
              <input
                type="text"
                placeholder="Admin email..."
                value={searchAdmin}
                onChange={(e) => setSearchAdmin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Resource Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Resource</label>
              <input
                type="text"
                placeholder="Driver/booking name..."
                value={searchResource}
                onChange={(e) => setSearchResource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Log Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Show Logs</label>
              <select
                value={logLimit}
                onChange={(e) => setLogLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={250}>Last 250</option>
                <option value={500}>Last 500</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                setFilterAction('all');
                setFilterResourceType('all');
                setFilterDate('today');
                setSearchAdmin('');
                setSearchResource('');
                setCustomDateStart('');
                setCustomDateEnd('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Changes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No audit logs found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        <div>{log.timestamp.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString()}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{log.adminEmail}</div>
                        <div className="text-xs text-gray-500">{log.browser} on {log.platform}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.actionLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getResourceIcon(log.resourceType)}</span>
                          <div>
                            <div className="font-medium text-gray-900">{log.resourceName}</div>
                            <div className="text-xs text-gray-500">{log.resourceType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="max-w-xs truncate">
                          {log.changesMade?.summary || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Showing X of Y */}
        <div className="mt-4 text-center text-white">
          Showing {filteredLogs.length} of {logs.length} audit logs
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">📋 Audit Log Details</h3>
                  <p className="text-sm text-purple-100 mt-1">{selectedLog.actionLabel}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-purple-200 text-3xl leading-none"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Timestamp</h4>
                    <p className="text-gray-900">{selectedLog.timestamp.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Admin</h4>
                    <p className="text-gray-900">{selectedLog.adminEmail}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Action Type</h4>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.actionLabel}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Resource</h4>
                    <p className="text-gray-900">{getResourceIcon(selectedLog.resourceType)} {selectedLog.resourceName}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">IP Address</h4>
                    <p className="text-gray-900">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Browser</h4>
                    <p className="text-gray-900">{selectedLog.browser} {selectedLog.browserVersion}</p>
                  </div>
                </div>

                {/* Changes Made */}
                {selectedLog.changesMade && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 text-lg">Changes Made</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3">{selectedLog.changesMade.summary}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Before */}
                        {selectedLog.changesMade.before && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <h5 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                              ❌ Before
                            </h5>
                            <pre className="text-xs text-red-900 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(selectedLog.changesMade.before, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {/* After */}
                        {selectedLog.changesMade.after && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                              ✅ After
                            </h5>
                            <pre className="text-xs text-green-900 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(selectedLog.changesMade.after, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason */}
                {selectedLog.reason && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Reason</h4>
                    <p className="text-gray-900 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      {selectedLog.reason}
                    </p>
                  </div>
                )}

                {/* Technical Details */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Technical Details</h4>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Platform:</span> {selectedLog.platform}</div>
                      <div><span className="font-medium">Language:</span> {selectedLog.language}</div>
                      <div className="col-span-2"><span className="font-medium">User Agent:</span> <span className="text-xs">{selectedLog.userAgent}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-lg border-t flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
