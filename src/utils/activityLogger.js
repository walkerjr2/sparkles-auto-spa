// Activity Logger Utility
// Logs all system activities to Firestore for audit trail
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get user's IP address (client-side approximation)
 * Note: For accurate IP, you'd need a backend API
 */
const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'Unknown';
  }
};

/**
 * Get user agent information
 */
const getUserAgent = () => {
  return navigator.userAgent || 'Unknown';
};

/**
 * Get browser name from user agent
 */
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  
  // Detect browser
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  
  // Detect OS
  if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';
  
  return `${browser} on ${os}`;
};

/**
 * Log an activity to Firestore
 * @param {Object} params - Activity details
 * @param {string} params.userEmail - Email of user performing action
 * @param {string} params.action - Type of action (CREATE_WORKER, UPDATE_BOOKING, etc.)
 * @param {string} params.targetType - What was affected (worker, booking, price, etc.)
 * @param {string} params.targetName - Name/ID of the affected item
 * @param {Object} params.changes - Before/after values (optional)
 * @param {string} params.description - Human-readable description
 */
export const logActivity = async ({
  userEmail,
  action,
  targetType,
  targetName,
  changes = null,
  description
}) => {
  try {
    // Get IP address (async)
    const ipAddress = await getUserIP();
    
    const logEntry = {
      timestamp: serverTimestamp(),
      userEmail: userEmail || 'Unknown',
      action,
      targetType,
      targetName,
      changes,
      description,
      ipAddress,
      userAgent: getUserAgent(),
      browserInfo: getBrowserInfo(),
      createdAt: new Date().toISOString() // Backup timestamp
    };

    await addDoc(collection(db, 'audit_logs'), logEntry);
    console.log('Activity logged:', logEntry);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging should not break the app
  }
};

/**
 * Activity type constants
 */
export const ACTIVITY_TYPES = {
  // Worker actions
  CREATE_WORKER: 'CREATE_WORKER',
  UPDATE_WORKER: 'UPDATE_WORKER',
  DELETE_WORKER: 'DELETE_WORKER',
  MIGRATE_WORKERS: 'MIGRATE_WORKERS',
  
  // Booking actions
  CREATE_BOOKING: 'CREATE_BOOKING',
  UPDATE_BOOKING_STATUS: 'UPDATE_BOOKING_STATUS',
  UPDATE_BOOKING_PRICE: 'UPDATE_BOOKING_PRICE',
  DELETE_BOOKING: 'DELETE_BOOKING',
  
  // Auth actions
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_LOGOUT: 'ADMIN_LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  
  // System actions
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SECURITY_ALERT: 'SECURITY_ALERT'
};

/**
 * Target type constants
 */
export const TARGET_TYPES = {
  WORKER: 'worker',
  BOOKING: 'booking',
  PRICE: 'price',
  AUTH: 'authentication',
  SYSTEM: 'system'
};
