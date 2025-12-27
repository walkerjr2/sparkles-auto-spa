import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Enhanced Comprehensive Booking Attempt Logger
 * Logs EVERY interaction with forensic-level detail
 */

// Session tracking
let sessionId = sessionStorage.getItem('booking_session_id');
if (!sessionId) {
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('booking_session_id', sessionId);
}

let sessionStartTime = sessionStorage.getItem('session_start_time');
if (!sessionStartTime) {
  sessionStartTime = new Date().toISOString();
  sessionStorage.setItem('session_start_time', sessionStartTime);
}

// Form interaction tracking
const formInteractions = {
  fieldsVisited: new Set(),
  fieldsFocused: {},
  fieldsCompleted: new Set(),
  clicksBeforeSubmit: 0,
  clickedElements: [],
  formLoadTime: null,
  timePerField: {}
};

/**
 * Get user's IP address with geolocation
 */
const getIPAddress = async () => {
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch('https://api.ipify.org?format=json', { 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    
    // Try to get location data
    try {
      const geoController = new AbortController();
      const geoTimeoutId = setTimeout(() => geoController.abort(), 3000);
      
      const geoResponse = await fetch(`https://ipapi.co/${data.ip}/json/`, { 
        signal: geoController.signal 
      });
      clearTimeout(geoTimeoutId);
      const geoData = await geoResponse.json();
      return {
        ip: data.ip,
        city: geoData.city,
        region: geoData.region,
        country: geoData.country_name,
        isp: geoData.org
      };
    } catch {
      return { ip: data.ip };
    }
  } catch (error) {
    return { ip: 'IP lookup failed' };
  }
};

/**
 * Detect VPN/Proxy usage
 */
const detectVPN = async (ipData) => {
  try {
    // Basic VPN detection - check for common VPN providers
    const vpnIndicators = ['vpn', 'proxy', 'private', 'tunnel'];
    const ispLower = ipData.isp?.toLowerCase() || '';
    return vpnIndicators.some(indicator => ispLower.includes(indicator));
  } catch {
    return false;
  }
};

/**
 * Get network diagnostics
 */
const getNetworkDiagnostics = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  return {
    effectiveType: connection?.effectiveType || 'Unknown', // '4g', '3g', '2g', 'slow-2g'
    downlink: connection?.downlink || null, // Mbps
    rtt: connection?.rtt || null, // Round trip time in ms
    saveData: connection?.saveData || false, // Data saver mode?
    online: navigator.onLine,
    connectionType: connection?.type || 'Unknown'
  };
};

/**
 * Get performance metrics
 */
const getPerformanceMetrics = () => {
  const perfData = window.performance.timing;
  const navigation = performance.getEntriesByType('navigation')[0];
  
  return {
    pageLoadTime: perfData.loadEventEnd - perfData.navigationStart + 'ms',
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart + 'ms',
    timeToInteractive: navigation?.domInteractive || 'N/A',
    dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart + 'ms',
    tcpConnection: perfData.connectEnd - perfData.connectStart + 'ms',
    serverResponse: perfData.responseEnd - perfData.requestStart + 'ms',
    domProcessing: perfData.domComplete - perfData.domLoading + 'ms'
  };
};

/**
 * Calculate fraud score
 */
const calculateFraudScore = (formInteractions, sessionData) => {
  let score = 0;
  const redFlags = [];
  
  // Form filled too quickly (< 5 seconds)
  const formFillTime = Date.now() - (formInteractions.formLoadTime || Date.now());
  if (formFillTime < 5000) {
    score += 0.3;
    redFlags.push('Form filled in less than 5 seconds');
  }
  
  // No mouse movement recorded
  if (formInteractions.clicksBeforeSubmit === 0) {
    score += 0.2;
    redFlags.push('No user interactions detected');
  }
  
  // Suspicious email domains
  const tempEmailDomains = ['mailinator', 'tempmail', '10minutemail', 'guerrillamail'];
  const email = sessionData.email || '';
  if (tempEmailDomains.some(domain => email.includes(domain))) {
    score += 0.4;
    redFlags.push('Temporary email domain detected');
  }
  
  // Very fast typing (bot-like)
  const avgTimePerField = Object.values(formInteractions.timePerField).reduce((a, b) => a + b, 0) / Object.keys(formInteractions.timePerField).length;
  if (avgTimePerField < 500) {
    score += 0.1;
    redFlags.push('Suspiciously fast typing');
  }
  
  return {
    fraudScore: Math.min(score, 1), // Cap at 1.0
    redFlags,
    botProbability: score > 0.7 ? 'High' : score > 0.4 ? 'Medium' : 'Low'
  };
};

/**
 * Get previous booking history for this customer
 */
const getCustomerHistory = async (email, phone) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    const previousBookings = snapshot.docs.map(doc => ({
      id: doc.id,
      date: doc.data().date,
      status: doc.data().status
    }));
    
    // Check previous attempts
    const attemptsRef = collection(db, 'booking_attempts');
    const attemptsQuery = query(attemptsRef, where('bookingDetails.email', '==', email));
    const attemptsSnapshot = await getDocs(attemptsQuery);
    
    const previousAttempts = attemptsSnapshot.docs.length;
    const previousFailures = attemptsSnapshot.docs.filter(doc => 
      doc.data().status.includes('FAILED') || doc.data().status === 'ERROR'
    ).length;
    
    return {
      isReturningCustomer: previousBookings.length > 0,
      previousBookings: previousBookings.length,
      previousAttempts,
      previousFailures,
      lastBookingDate: previousBookings[0]?.date || null,
      successRate: previousAttempts > 0 ? ((previousAttempts - previousFailures) / previousAttempts * 100).toFixed(1) + '%' : 'N/A'
    };
  } catch (error) {
    return {
      isReturningCustomer: false,
      previousBookings: 0,
      error: 'Could not fetch history'
    };
  }
};

/**
 * Calculate user intent score
 */
const calculateIntentScore = (formInteractions) => {
  let score = 0;
  const signals = [];
  
  // Filled all fields
  if (formInteractions.fieldsCompleted.size >= 6) {
    score += 0.3;
    signals.push('Completed all fields');
  }
  
  // Spent time on date selection (serious booking)
  if (formInteractions.timePerField['date'] > 5000) {
    score += 0.2;
    signals.push('Spent time selecting date');
  }
  
  // Revisited form multiple times
  if (formInteractions.clicksBeforeSubmit > 10) {
    score += 0.15;
    signals.push('Multiple interactions with form');
  }
  
  // Hovered over submit button (hesitation but intent)
  if (formInteractions.clickedElements.includes('submit-button')) {
    score += 0.15;
    signals.push('Engaged with submit button');
  }
  
  // Checked multiple time slots
  if (formInteractions.fieldsVisited.has('time')) {
    score += 0.2;
    signals.push('Explored time options');
  }
  
  return {
    intentScore: Math.min(score, 1),
    intentLevel: score > 0.7 ? 'High' : score > 0.4 ? 'Medium' : 'Low',
    signals
  };
};

/**
 * Get detailed browser and device information
 */
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  
  // Browser detection with version
  let browser = 'Unknown';
  let browserVersion = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'Opera';
    browserVersion = ua.match(/OPR\/([0-9.]+)/)?.[1] || 'Unknown';
  }
  
  // OS detection
  let os = 'Unknown';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
  else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (ua.includes('Mac OS X')) {
    const version = ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.');
    os = `macOS ${version || ''}`;
  } else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) {
    const version = ua.match(/Android ([0-9.]+)/)?.[1];
    os = `Android ${version || ''}`;
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    const version = ua.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.');
    os = `iOS ${version || ''}`;
  }
  
  // Device type
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/.test(ua);
  const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
  
  return {
    browser,
    browserVersion,
    os,
    deviceType,
    userAgent: ua,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio || 1,
    language: navigator.language,
    languages: navigator.languages?.join(', ') || navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1'
  };
};

/**
 * Log booking attempt status types
 */
export const BOOKING_STATUS = {
  BUTTON_CLICKED: 'BUTTON_CLICKED',           // User clicked submit
  VALIDATION_FAILED: 'VALIDATION_FAILED',     // Form validation failed
  FIREBASE_STARTED: 'FIREBASE_STARTED',       // Started saving to Firestore
  FIREBASE_SUCCESS: 'FIREBASE_SUCCESS',       // Successfully saved to Firestore
  FIREBASE_FAILED: 'FIREBASE_FAILED',         // Firestore save failed
  EMAIL_STARTED: 'EMAIL_STARTED',             // Started sending emails
  EMAIL_SUCCESS: 'EMAIL_SUCCESS',             // Emails sent successfully
  EMAIL_FAILED: 'EMAIL_FAILED',               // Email sending failed
  BOOKING_COMPLETE: 'BOOKING_COMPLETE',       // Entire process completed
  USER_CANCELLED: 'USER_CANCELLED',           // User cancelled confirmation
  ERROR: 'ERROR'                              // General error
};

/**
 * Main logging function - logs EVERYTHING with enhanced forensics
 */
export const logBookingAttempt = async ({
  status,
  bookingData = {},
  errorMessage = null,
  errorStack = null,
  additionalInfo = {},
  apiResponseTimes = {}
}) => {
  try {
    const ipData = await getIPAddress();
    const browserInfo = getBrowserInfo();
    const networkDiag = getNetworkDiagnostics();
    const perfMetrics = getPerformanceMetrics();
    const vpnDetected = await detectVPN(ipData);
    const fraudAnalysis = calculateFraudScore(formInteractions, bookingData);
    const intentAnalysis = calculateIntentScore(formInteractions);
    
    // Get customer history (async, don't block)
    let customerHistory = { isReturningCustomer: false };
    if (bookingData.email) {
      customerHistory = await getCustomerHistory(bookingData.email, bookingData.phone);
    }
    
    // Calculate session duration
    const sessionDuration = Date.now() - new Date(sessionStartTime).getTime();
    
    // Create comprehensive log entry
    const logEntry = {
      // Status
      status,
      timestamp: serverTimestamp(),
      timestampISO: new Date().toISOString(),
      
      // Session Tracking
      sessionId,
      sessionStartTime,
      sessionDuration: Math.floor(sessionDuration / 1000) + 's',
      deviceSwitches: 0, // Track if they switched devices mid-booking
      
      // User Information
      ipAddress: ipData.ip,
      ipLocation: {
        city: ipData.city,
        region: ipData.region,
        country: ipData.country,
        isp: ipData.isp
      },
      vpnDetected,
      ...browserInfo,
      
      // Network Diagnostics
      network: networkDiag,
      
      // Performance Metrics
      performance: perfMetrics,
      
      // Booking Data (sanitized - no sensitive info in logs)
      bookingDetails: {
        service: bookingData.service || 'Not provided',
        vehicleSize: bookingData.vehicleSize || 'Not provided',
        location: bookingData.location || 'Not provided',
        date: bookingData.date || 'Not provided',
        time: bookingData.time || 'Not provided',
        name: bookingData.name || 'Not provided',
        email: bookingData.email ? bookingData.email.substring(0, 3) + '***@***' : 'Not provided',
        phone: bookingData.phone ? '***-***-' + bookingData.phone.slice(-4) : 'Not provided',
        hasLatLng: !!(bookingData.lat && bookingData.lng),
      },
      
      // Form Interaction Tracking
      formInteractions: {
        fieldsVisited: Array.from(formInteractions.fieldsVisited),
        fieldsCompleted: Array.from(formInteractions.fieldsCompleted),
        fieldsEmpty: ['service', 'date', 'time', 'name', 'email', 'phone', 'location']
          .filter(field => !formInteractions.fieldsCompleted.has(field)),
        clicksBeforeSubmit: formInteractions.clicksBeforeSubmit,
        clickedElements: formInteractions.clickedElements,
        timePerField: formInteractions.timePerField,
        totalTimeOnForm: formInteractions.formLoadTime 
          ? Math.floor((Date.now() - formInteractions.formLoadTime) / 1000) + 's'
          : 'Unknown'
      },
      
      // User Behavior Analytics
      userBehavior: {
        scrollDepth: Math.floor((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100) + '%',
        mouseMovements: formInteractions.clicksBeforeSubmit,
        timeOnPage: Math.floor(sessionDuration / 1000) + 's',
        pageVisibility: document.visibilityState,
        tabSwitches: parseInt(sessionStorage.getItem('tab_switches') || '0')
      },
      
      // Intent & Fraud Analysis
      intentAnalysis,
      fraudAnalysis,
      
      // Customer History
      customerHistory,
      
      // Error Information (Enhanced)
      error: errorMessage ? {
        message: errorMessage,
        stack: errorStack,
        code: additionalInfo.errorCode || 'UNKNOWN',
        type: additionalInfo.errorType || 'Error',
        timestamp: new Date().toISOString(),
        userAction: additionalInfo.userAction || 'Unknown action',
        retryable: !errorMessage.includes('Permission') && !errorMessage.includes('auth'),
        suggestedFix: getSuggestedFix(errorMessage),
        affectedFields: additionalInfo.affectedFields || [],
        
        // System state at error time
        systemState: {
          online: navigator.onLine,
          connection: networkDiag.effectiveType,
          pendingRequests: 0,
          cacheSize: 'N/A'
        },
        
        // User state at error time
        userState: {
          timeOnSite: Math.floor(sessionDuration / 1000) + 's',
          formAttempts: parseInt(sessionStorage.getItem('form_attempts') || '0') + 1,
          lastError: sessionStorage.getItem('last_error') || 'None'
        }
      } : null,
      
      // API Response Times
      apiResponseTimes: {
        firebase: apiResponseTimes.firebase || 'N/A',
        emailjs: apiResponseTimes.emailjs || 'N/A',
        ipLookup: apiResponseTimes.ipLookup || 'N/A'
      },
      
      // Additional Context
      ...additionalInfo,
      
      // Page State
      pageUrl: window.location.href,
      referrer: document.referrer || 'Direct visit',
      
      // Session Info
      sessionStorage: {
        hasData: sessionStorage.length > 0,
        keys: Object.keys(sessionStorage)
      },
      
      // Connection Info
      onlineStatus: navigator.onLine ? 'Online' : 'Offline',
      connectionType: networkDiag.effectiveType,
      
      // Conversion Funnel Position
      funnelStep: getCurrentFunnelStep(bookingData),
      
      // A/B Test Variant (if applicable)
      abTestVariant: sessionStorage.getItem('ab_test_variant') || 'control'
    };
    
    // Save to Firestore in separate collection for forensic analysis
    await addDoc(collection(db, 'booking_attempts'), logEntry);
    
    // Update session storage
    sessionStorage.setItem('last_error', errorMessage || 'None');
    sessionStorage.setItem('form_attempts', (parseInt(sessionStorage.getItem('form_attempts') || '0') + 1).toString());
    
    // Check if we need to send alerts
    await checkAndSendAlerts(status, logEntry);
    
    // Also log to console in development for immediate visibility
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Enhanced Booking Attempt Logged:', {
        status,
        email: bookingData.email,
        timestamp: new Date().toLocaleTimeString(),
        fraudScore: fraudAnalysis.fraudScore,
        intentScore: intentAnalysis.intentScore
      });
    }
    
    return true;
  } catch (error) {
    // Even if logging fails, don't break the booking process
    console.error('⚠️ Failed to log booking attempt:', error);
    return false;
  }
};

/**
 * Get suggested fix for common errors
 */
const getSuggestedFix = (errorMessage) => {
  if (!errorMessage) return 'No error';
  
  const errorLower = errorMessage.toLowerCase();
  if (errorLower.includes('permission')) return 'Check Firestore security rules';
  if (errorLower.includes('network')) return 'Check internet connection';
  if (errorLower.includes('timeout')) return 'Increase timeout or check API response time';
  if (errorLower.includes('auth')) return 'User needs to be authenticated';
  if (errorLower.includes('quota')) return 'Check Firebase or EmailJS quota limits';
  if (errorLower.includes('email')) return 'Verify EmailJS configuration';
  
  return 'Review error logs for details';
};

/**
 * Get current funnel step
 */
const getCurrentFunnelStep = (bookingData) => {
  if (!bookingData.service) return 'Step 1: Service Selection';
  if (!bookingData.location) return 'Step 2: Location Entry';
  if (!bookingData.date) return 'Step 3: Date Selection';
  if (!bookingData.time) return 'Step 4: Time Selection';
  if (!bookingData.name || !bookingData.email) return 'Step 5: Contact Info';
  return 'Step 6: Submit';
};

/**
 * Check if alerts should be sent
 */
const checkAndSendAlerts = async (status, logEntry) => {
  try {
    // Only check on failures
    if (!status.includes('FAILED') && status !== 'ERROR') return;
    
    // Check failure rate in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = await getDocs(
      query(
        collection(db, 'booking_attempts'),
        where('timestamp', '>=', oneHourAgo)
      )
    );
    
    const total = recentLogs.docs.length;
    const failed = recentLogs.docs.filter(doc => 
      doc.data().status.includes('FAILED') || doc.data().status === 'ERROR'
    ).length;
    
    const failureRate = total > 0 ? failed / total : 0;
    
    // Alert if failure rate > 50%
    if (failureRate > 0.5 && total > 5) {
      console.error('🚨 ALERT: High failure rate detected:', {
        failureRate: (failureRate * 100).toFixed(1) + '%',
        totalAttempts: total,
        failedAttempts: failed
      });
      
      // TODO: Send SMS/email alert to admin
      // await sendSMS('🚨 50%+ booking failure rate in last hour!');
    }
  } catch (error) {
    console.error('Alert check failed:', error);
  }
};

/**
 * Track form field interactions
 */
export const trackFieldInteraction = (fieldName, action, duration = 0) => {
  if (action === 'visit') {
    formInteractions.fieldsVisited.add(fieldName);
  } else if (action === 'focus') {
    formInteractions.fieldsFocused[fieldName] = (formInteractions.fieldsFocused[fieldName] || 0) + 1;
  } else if (action === 'complete') {
    formInteractions.fieldsCompleted.add(fieldName);
    formInteractions.timePerField[fieldName] = duration;
  }
};

/**
 * Track user clicks
 */
export const trackClick = (elementName) => {
  formInteractions.clicksBeforeSubmit++;
  formInteractions.clickedElements.push(elementName);
};

/**
 * Initialize form tracking
 */
export const initFormTracking = () => {
  formInteractions.formLoadTime = Date.now();
};

/**
 * Track tab visibility changes
 */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      const switches = parseInt(sessionStorage.getItem('tab_switches') || '0');
      sessionStorage.setItem('tab_switches', (switches + 1).toString());
    }
  });
}

/**
 * Helper function to log validation failures with field details
 */
export const logValidationFailure = async (bookingData, failedFields = []) => {
  return logBookingAttempt({
    status: BOOKING_STATUS.VALIDATION_FAILED,
    bookingData,
    additionalInfo: {
      failedFields,
      validationMessage: `Validation failed for: ${failedFields.join(', ')}`
    }
  });
};

/**
 * Helper function to log Firebase errors with details
 */
export const logFirebaseError = async (bookingData, error) => {
  return logBookingAttempt({
    status: BOOKING_STATUS.FIREBASE_FAILED,
    bookingData,
    errorMessage: error.message,
    errorStack: error.stack,
    additionalInfo: {
      errorCode: error.code,
      errorType: error.name
    }
  });
};

/**
 * Helper function to log email errors
 */
export const logEmailError = async (bookingData, error, emailType = 'unknown') => {
  return logBookingAttempt({
    status: BOOKING_STATUS.EMAIL_FAILED,
    bookingData,
    errorMessage: error.message,
    errorStack: error.stack,
    additionalInfo: {
      emailType, // 'business' or 'customer'
      errorDetails: error.text || 'No additional details'
    }
  });
};
