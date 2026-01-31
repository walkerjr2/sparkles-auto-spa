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
  
  // NEW FEATURE 6: Advanced Search & Filter Presets
  const [filterDevice, setFilterDevice] = useState('all');
  const [filterBrowser, setFilterBrowser] = useState('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [searchIP, setSearchIP] = useState('');
  const [searchBookingId, setSearchBookingId] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [savedPresets, setSavedPresets] = useState([]);
  const [currentPresetName, setCurrentPresetName] = useState('');
  
  // NEW FEATURE 3: Customer Journey Timeline (selected log for detail view)
  const [selectedLog, setSelectedLog] = useState(null);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  
  // PostHog Session Replay Modal
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [replayUrl, setReplayUrl] = useState('');
  
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

  // Apply filters (ENHANCED with Feature 6)
  useEffect(() => {
    let filtered = [...logs];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.status === filterStatus);
    }

    // Filter by date
    const now = new Date();
    if (filterDate === 'custom' && customDateStart && customDateEnd) {
      const start = new Date(customDateStart);
      const end = new Date(customDateEnd);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => log.timestamp >= start && log.timestamp <= end);
    } else if (filterDate === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      filtered = filtered.filter(log => log.timestamp >= todayStart);
    } else if (filterDate === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => log.timestamp >= weekAgo);
    } else if (filterDate === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => log.timestamp >= monthAgo);
    }

    // Search by email
    if (searchEmail) {
      filtered = filtered.filter(log => 
        log.bookingDetails?.email?.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    // Search by phone
    if (searchPhone) {
      filtered = filtered.filter(log => 
        log.bookingDetails?.phone?.includes(searchPhone)
      );
    }

    // NEW: Filter by device type
    if (filterDevice !== 'all') {
      filtered = filtered.filter(log => 
        log.deviceType?.toLowerCase() === filterDevice.toLowerCase()
      );
    }

    // NEW: Filter by browser
    if (filterBrowser !== 'all') {
      filtered = filtered.filter(log => 
        log.browser?.toLowerCase().includes(filterBrowser.toLowerCase())
      );
    }

    // NEW: Search by IP address
    if (searchIP) {
      filtered = filtered.filter(log => 
        log.ipAddress?.includes(searchIP)
      );
    }

    // NEW: Search by booking ID
    if (searchBookingId) {
      filtered = filtered.filter(log => 
        log.bookingDetails?.bookingId?.includes(searchBookingId)
      );
    }

    // NEW: Filter by service type
    if (filterService !== 'all') {
      filtered = filtered.filter(log => 
        log.bookingDetails?.service?.toLowerCase().includes(filterService.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filterStatus, filterDate, searchEmail, searchPhone, filterDevice, filterBrowser, searchIP, searchBookingId, filterService, customDateStart, customDateEnd]);

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

  // Get success/failure stats (ENHANCED for Feature 1: Conversion Funnel)
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

  // NEW FEATURE 1: Conversion Funnel Analytics
  const getFunnelData = () => {
    const allLogs = filteredLogs;
    
    // Count unique sessions or attempts at each stage
    const buttonClicked = allLogs.filter(l => l.status === 'BUTTON_CLICKED').length;
    const validationPassed = allLogs.filter(l => 
      l.status !== 'VALIDATION_FAILED' && 
      (l.status === 'FIREBASE_STARTED' || l.status === 'FIREBASE_SUCCESS' || 
       l.status === 'EMAIL_SUCCESS' || l.status === 'BOOKING_COMPLETE')
    ).length;
    const firebaseSaved = allLogs.filter(l => 
      l.status === 'FIREBASE_SUCCESS' || l.status === 'EMAIL_SUCCESS' || l.status === 'BOOKING_COMPLETE'
    ).length;
    const emailSent = allLogs.filter(l => 
      l.status === 'EMAIL_SUCCESS' || l.status === 'BOOKING_COMPLETE'
    ).length;
    const completed = allLogs.filter(l => l.status === 'BOOKING_COMPLETE').length;

    // Calculate drop-off percentages
    const total = buttonClicked || 1; // Avoid division by zero
    return {
      stages: [
        { name: 'Submit Clicked', count: buttonClicked, percentage: 100, dropOff: 0 },
        { name: 'Validation Passed', count: validationPassed, percentage: Math.round((validationPassed / total) * 100), dropOff: buttonClicked - validationPassed },
        { name: 'Saved to Database', count: firebaseSaved, percentage: Math.round((firebaseSaved / total) * 100), dropOff: validationPassed - firebaseSaved },
        { name: 'Email Sent', count: emailSent, percentage: Math.round((emailSent / total) * 100), dropOff: firebaseSaved - emailSent },
        { name: 'Booking Complete', count: completed, percentage: Math.round((completed / total) * 100), dropOff: emailSent - completed }
      ],
      conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // NEW FEATURE 6: Save/Load Filter Presets
  const saveFilterPreset = () => {
    if (!currentPresetName.trim()) {
      alert('Please enter a preset name');
      return;
    }
    
    const preset = {
      name: currentPresetName,
      filters: {
        filterStatus,
        filterDate,
        filterDevice,
        filterBrowser,
        filterService,
        searchEmail,
        searchPhone,
        searchIP,
        searchBookingId,
        customDateStart,
        customDateEnd
      }
    };
    
    const newPresets = [...savedPresets, preset];
    setSavedPresets(newPresets);
    localStorage.setItem('forensicsPresets', JSON.stringify(newPresets));
    setCurrentPresetName('');
    alert(`Preset "${preset.name}" saved!`);
  };

  const loadFilterPreset = (preset) => {
    setFilterStatus(preset.filters.filterStatus);
    setFilterDate(preset.filters.filterDate);
    setFilterDevice(preset.filters.filterDevice);
    setFilterBrowser(preset.filters.filterBrowser);
    setFilterService(preset.filters.filterService);
    setSearchEmail(preset.filters.searchEmail);
    setSearchPhone(preset.filters.searchPhone);
    setSearchIP(preset.filters.searchIP);
    setSearchBookingId(preset.filters.searchBookingId);
    setCustomDateStart(preset.filters.customDateStart);
    setCustomDateEnd(preset.filters.customDateEnd);
  };

  const deleteFilterPreset = (presetName) => {
    const newPresets = savedPresets.filter(p => p.name !== presetName);
    setSavedPresets(newPresets);
    localStorage.setItem('forensicsPresets', JSON.stringify(newPresets));
  };

  const clearAllFilters = () => {
    setFilterStatus('all');
    setFilterDate('today');
    setFilterDevice('all');
    setFilterBrowser('all');
    setFilterService('all');
    setSearchEmail('');
    setSearchPhone('');
    setSearchIP('');
    setSearchBookingId('');
    setCustomDateStart('');
    setCustomDateEnd('');
  };

  // Load saved presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('forensicsPresets');
    if (saved) {
      setSavedPresets(JSON.parse(saved));
    }
  }, []);

  const stats = getStats();
  const funnelData = getFunnelData();

  // NEW FEATURE 3: Get Customer Journey for selected log
  const getCustomerJourney = (log) => {
    // Group all logs for this customer
    const customerLogs = logs.filter(l => 
      (l.bookingDetails?.email && l.bookingDetails.email === log.bookingDetails?.email) ||
      (l.bookingDetails?.phone && l.bookingDetails.phone === log.bookingDetails?.phone)
    ).sort((a, b) => a.timestamp - b.timestamp);

    return customerLogs;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - FEATURE 14: Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
                🔬 Booking Forensics Lab
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Super detailed logging of EVERY booking attempt
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={exportToCSV}
                className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm md:text-base"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-3 md:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm md:text-base"
              >
                🏠 Home
              </button>
            </div>
          </div>

          {/* Stats - FEATURE 14: Mobile responsive grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-3 md:p-4 border-l-4 border-blue-500">
              <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs md:text-sm text-gray-600">Total Attempts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 md:p-4 border-l-4 border-green-500">
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs md:text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 md:p-4 border-l-4 border-red-500">
              <div className="text-xl md:text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs md:text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 md:p-4 border-l-4 border-yellow-500">
              <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.buttonClicks}</div>
              <div className="text-xs md:text-sm text-gray-600">Button Clicks</div>
            </div>
          </div>
        </div>

        {/* FEATURE 1: CONVERSION FUNNEL VISUALIZATION */}
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Conversion Funnel Analysis
            <span className="text-sm font-normal text-gray-500">({funnelData.conversionRate}% completion rate)</span>
          </h2>
          <div className="space-y-3">
            {funnelData.stages.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm md:text-base font-medium text-gray-700">{stage.name}</span>
                  <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
                    <span className="text-gray-600">{stage.count} attempts</span>
                    <span className="font-bold text-blue-600">{stage.percentage}%</span>
                    {stage.dropOff > 0 && (
                      <span className="text-red-500">↓ {stage.dropOff} dropped</span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stage.percentage >= 80 ? 'bg-green-500' :
                      stage.percentage >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-xs md:text-sm text-blue-800">
              <strong>💡 Insight:</strong> The funnel shows where customers drop off. 
              Large drops indicate problems at that stage (e.g., validation errors, slow loading, email failures).
            </p>
          </div>
        </div>

        {/* FEATURE 6: SAVED FILTER PRESETS */}
        {savedPresets.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              ⭐ Saved Filter Presets
            </h2>
            <div className="flex flex-wrap gap-2">
              {savedPresets.map((preset, index) => (
                <div key={index} className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                  <button
                    onClick={() => loadFilterPreset(preset)}
                    className="text-sm font-medium text-purple-700 hover:text-purple-900"
                  >
                    📁 {preset.name}
                  </button>
                  <button
                    onClick={() => deleteFilterPreset(preset.name)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURE 6: ENHANCED FILTERS - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-0">🔍 Advanced Filters</h2>
            <button
              onClick={clearAllFilters}
              className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 self-start"
            >
              🔄 Clear All
            </button>
          </div>
          
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
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
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Device Type</label>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
              >
                <option value="all">All Devices</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Browser</label>
              <select
                value={filterBrowser}
                onChange={(e) => setFilterBrowser(e.target.value)}
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
              >
                <option value="all">All Browsers</option>
                <option value="chrome">Chrome</option>
                <option value="safari">Safari</option>
                <option value="firefox">Firefox</option>
                <option value="edge">Edge</option>
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
              >
                <option value="all">All Services</option>
                <option value="standard">Standard Wash</option>
                <option value="premium">Premium Detail</option>
                <option value="express">Express Wash</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {filterDate === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
                />
              </div>
            </div>
          )}

          {/* Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Search Email</label>
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Search Phone</label>
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Last 4 digits..."
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Search IP</label>
              <input
                type="text"
                value={searchIP}
                onChange={(e) => setSearchIP(e.target.value)}
                placeholder="192.168..."
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Booking ID</label>
              <input
                type="text"
                value={searchBookingId}
                onChange={(e) => setSearchBookingId(e.target.value)}
                placeholder="booking-123..."
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Limit</label>
              <select
                value={logLimit}
                onChange={(e) => setLogLimit(Number(e.target.value))}
                className="w-full px-2 md:px-3 py-2 border rounded-lg text-sm md:text-base"
              >
                <option value="50">Last 50</option>
                <option value="100">Last 100</option>
                <option value="500">Last 500</option>
                <option value="1000">Last 1000</option>
              </select>
            </div>
          </div>

          {/* Save Preset */}
          <div className="mt-4 pt-4 border-t flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={currentPresetName}
              onChange={(e) => setCurrentPresetName(e.target.value)}
              placeholder="Enter preset name..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm md:text-base"
            />
            <button
              onClick={saveFilterPreset}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base whitespace-nowrap"
            >
              💾 Save Current Filters as Preset
            </button>
          </div>
        </div>

        {/* Logs Table - FEATURE 14: Mobile Optimized with horizontal scroll */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Details</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device/Browser</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network/Performance</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Analytics</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      No booking attempts found matching filters
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-4 py-3 text-sm text-gray-900">
                        <div>{log.timestamp.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString()}</div>
                      </td>
                      <td className="px-3 md:px-4 py-3">
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
                      <td className="px-3 md:px-4 py-3 text-sm">
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
                      <td className="px-3 md:px-4 py-3 text-sm">
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
                      <td className="px-3 md:px-4 py-3 text-sm">
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
                      <td className="px-3 md:px-4 py-3 text-sm">
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
                      <td className="px-3 md:px-4 py-3 text-sm">
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
                      <td className="px-3 md:px-4 py-3 text-sm">
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
                      <td className="px-3 md:px-4 py-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setShowJourneyModal(true);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 whitespace-nowrap"
                          >
                            🗺️ Journey
                          </button>
                          {log.posthogSessionUrl && (
                            <button
                              onClick={() => {
                                setReplayUrl(log.posthogSessionUrl);
                                setShowReplayModal(true);
                              }}
                              className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 whitespace-nowrap"
                            >
                              🎬 Replay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile scroll hint */}
          <div className="md:hidden p-3 bg-gray-50 text-center text-xs text-gray-500">
            👈 Swipe left to see more columns
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 rounded-lg p-3 md:p-4 mt-4 md:mt-6 border-l-4 border-yellow-400">
          <h3 className="font-bold text-yellow-800 mb-2 text-sm md:text-base">🔍 How to Use This</h3>
          <ul className="text-xs md:text-sm text-yellow-700 space-y-1">
            <li>• <strong>BUTTON_CLICKED</strong> = User pressed submit (proves they tried)</li>
            <li>• <strong>VALIDATION_FAILED</strong> = Form had errors (shows what was missing)</li>
            <li>• <strong>FIREBASE_SUCCESS</strong> = Booking saved to database</li>
            <li>• <strong>EMAIL_SUCCESS</strong> = Confirmation emails sent</li>
            <li>• <strong>BOOKING_COMPLETE</strong> = Everything worked perfectly</li>
            <li>• Click <strong>🗺️ Journey</strong> button to see customer's full booking timeline</li>
            <li>• Use the conversion funnel to identify where most customers drop off</li>
            <li>• Save filter combinations as presets for quick access</li>
          </ul>
        </div>

        {/* FEATURE 3: CUSTOMER JOURNEY TIMELINE MODAL */}
        {showJourneyModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowJourneyModal(false)}>
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 md:p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2">🗺️ Customer Journey Timeline</h2>
                    <p className="text-sm md:text-base opacity-90">
                      {selectedLog.bookingDetails?.name} ({selectedLog.bookingDetails?.email})
                    </p>
                  </div>
                  <button
                    onClick={() => setShowJourneyModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 text-xl md:text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Customer Summary */}
              <div className="p-4 md:p-6 bg-gray-50 border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Contact</div>
                    <div className="font-medium text-sm md:text-base">{selectedLog.bookingDetails?.name}</div>
                    <div className="text-xs text-gray-600">{selectedLog.bookingDetails?.email}</div>
                    <div className="text-xs text-gray-600">{selectedLog.bookingDetails?.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Booking Details</div>
                    <div className="font-medium text-sm md:text-base">{selectedLog.bookingDetails?.service}</div>
                    <div className="text-xs text-gray-600">{selectedLog.bookingDetails?.vehicleSize}</div>
                    <div className="text-xs text-gray-600">{selectedLog.bookingDetails?.date} at {selectedLog.bookingDetails?.time}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Device & Location</div>
                    <div className="font-medium text-sm md:text-base">{selectedLog.deviceType} - {selectedLog.browser}</div>
                    <div className="text-xs text-gray-600">IP: {selectedLog.ipAddress}</div>
                    <div className="text-xs text-gray-600">{selectedLog.ipLocation?.city}, {selectedLog.ipLocation?.country}</div>
                  </div>
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-800">📅 Full Journey Timeline</h3>
                <div className="space-y-4">
                  {getCustomerJourney(selectedLog).map((journeyLog, index) => (
                    <div key={journeyLog.id} className="relative pl-6 md:pl-8 pb-4 border-l-2 border-gray-300 last:border-l-0">
                      {/* Timeline dot */}
                      <div className={`absolute left-0 -ml-2 md:-ml-2.5 w-4 h-4 md:w-5 md:h-5 rounded-full ${
                        journeyLog.status === 'BOOKING_COMPLETE' ? 'bg-green-500' :
                        journeyLog.status.includes('FAILED') || journeyLog.status === 'ERROR' ? 'bg-red-500' :
                        journeyLog.status.includes('SUCCESS') ? 'bg-green-500' :
                        'bg-blue-500'
                      } border-2 md:border-4 border-white shadow`}></div>

                      {/* Event card */}
                      <div className="bg-white border rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                          <div>
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(journeyLog.status)}`}>
                              {journeyLog.status.replace(/_/g, ' ')}
                            </span>
                            {index === 0 && (
                              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                                📍 Selected Event
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {journeyLog.timestamp.toLocaleDateString()} {journeyLog.timestamp.toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Event details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm mt-2">
                          {journeyLog.bookingDetails?.bookingId && (
                            <div>
                              <span className="font-medium text-gray-700">Booking ID:</span>
                              <span className="ml-2 text-gray-600">{journeyLog.bookingDetails.bookingId}</span>
                            </div>
                          )}
                          {journeyLog.formInteractions && (
                            <div>
                              <span className="font-medium text-gray-700">Time on Form:</span>
                              <span className="ml-2 text-gray-600">{journeyLog.formInteractions.totalTimeOnForm}</span>
                            </div>
                          )}
                          {journeyLog.apiResponseTimes && (
                            <div>
                              <span className="font-medium text-gray-700">API Response:</span>
                              <span className="ml-2 text-gray-600">
                                Firebase: {journeyLog.apiResponseTimes.firebase}, Email: {journeyLog.apiResponseTimes.emailjs}
                              </span>
                            </div>
                          )}
                          {journeyLog.error && (
                            <div className="col-span-full">
                              <span className="font-medium text-red-700">Error:</span>
                              <span className="ml-2 text-red-600">{journeyLog.error.message || journeyLog.error}</span>
                            </div>
                          )}
                        </div>

                        {/* Additional metadata */}
                        {journeyLog.intentAnalysis && (
                          <div className="mt-2 pt-2 border-t">
                            <span className="text-xs font-medium text-gray-600">Intent Level: </span>
                            <span className={`text-xs font-semibold ${
                              journeyLog.intentAnalysis.intentLevel === 'High' ? 'text-green-600' :
                              journeyLog.intentAnalysis.intentLevel === 'Medium' ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {journeyLog.intentAnalysis.intentLevel}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Journey Summary */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-bold text-blue-800 mb-2 text-sm md:text-base">📊 Journey Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                    <div>
                      <div className="text-gray-600">Total Attempts</div>
                      <div className="font-bold text-gray-800">{getCustomerJourney(selectedLog).length}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Completed</div>
                      <div className="font-bold text-green-600">
                        {getCustomerJourney(selectedLog).filter(l => l.status === 'BOOKING_COMPLETE').length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Failed</div>
                      <div className="font-bold text-red-600">
                        {getCustomerJourney(selectedLog).filter(l => 
                          l.status.includes('FAILED') || l.status === 'ERROR'
                        ).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Device</div>
                      <div className="font-bold text-gray-800">{selectedLog.deviceType}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-lg border-t flex justify-end gap-2">
                <button
                  onClick={() => setShowJourneyModal(false)}
                  className="px-4 md:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm md:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PostHog Session Replay Modal */}
        {showReplayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    🎬 Session Replay
                  </h3>
                  <p className="text-sm text-purple-100 mt-1">Opening PostHog session replay...</p>
                </div>
                <button
                  onClick={() => {
                    setShowReplayModal(false);
                    setReplayUrl('');
                  }}
                  className="text-white hover:text-purple-200 text-3xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body - Info & Action */}
              <div className="flex-1 p-6 md:p-8 overflow-auto">
                <div className="max-w-2xl mx-auto">
                  {/* Info Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🎥</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800 mb-2">
                          Ready to Watch Session Replay
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          PostHog's session replay will open in a new tab where you can see:
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Mouse movements and clicks</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Page navigation and scrolling</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Form interactions (masked for privacy)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Console logs and network requests</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>Exact timestamps of all events</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Card */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-gray-600 text-sm mb-4">
                      Click the button below to open the session replay in PostHog
                    </p>
                    <a
                      href={replayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        // Auto-close modal after opening
                        setTimeout(() => {
                          setShowReplayModal(false);
                          setReplayUrl('');
                        }, 500);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      <span className="text-xl">🎬</span>
                      Open Session Replay
                      <span className="text-xl">→</span>
                    </a>
                    <p className="text-xs text-gray-500 mt-3">
                      💡 Tip: Allow pop-ups from this site if the replay doesn't open
                    </p>
                  </div>

                  {/* Quick Info */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Note:</span> Session replays may take 30-60 seconds to fully process after a booking is submitted.
                      If you see "Session not found", wait a moment and try again.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t bg-gray-50 flex justify-center items-center rounded-b-lg">
                <button
                  onClick={() => {
                    setShowReplayModal(false);
                    setReplayUrl('');
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm md:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
