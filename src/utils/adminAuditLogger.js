import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

/**
 * Admin Audit Log System
 * Tracks all administrative actions for accountability and debugging
 */

// Action Types
export const AUDIT_ACTIONS = {
  // Driver Management
  DRIVER_CREATED: 'DRIVER_CREATED',
  DRIVER_UPDATED: 'DRIVER_UPDATED',
  DRIVER_DELETED: 'DRIVER_DELETED',
  DRIVER_SCHEDULE_UPDATED: 'DRIVER_SCHEDULE_UPDATED',
  DRIVER_SERVICE_AREA_UPDATED: 'DRIVER_SERVICE_AREA_UPDATED',
  DRIVER_STATUS_CHANGED: 'DRIVER_STATUS_CHANGED',
  
  // Booking Management
  BOOKING_UPDATED: 'BOOKING_UPDATED',
  BOOKING_DELETED: 'BOOKING_DELETED',
  BOOKING_STATUS_CHANGED: 'BOOKING_STATUS_CHANGED',
  BOOKING_ASSIGNED: 'BOOKING_ASSIGNED',
  BOOKING_REASSIGNED: 'BOOKING_REASSIGNED',
  
  // User Management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  
  // Settings & Configuration
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  PRICING_UPDATED: 'PRICING_UPDATED',
  SERVICE_UPDATED: 'SERVICE_UPDATED',
  
  // System Actions
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_LOGOUT: 'ADMIN_LOGOUT',
  DATA_EXPORT: 'DATA_EXPORT',
  BULK_OPERATION: 'BULK_OPERATION',
};

/**
 * Get client IP address (best effort)
 */
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not fetch IP address:', error);
    return 'unknown';
  }
};

/**
 * Get browser and device information
 */
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  // Detect browser
  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
  }
  
  return {
    browser: browserName,
    browserVersion: browserVersion,
    userAgent: ua,
    platform: navigator.platform,
    language: navigator.language,
  };
};

/**
 * Main audit logging function
 * 
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - Action type from AUDIT_ACTIONS
 * @param {string} params.resourceType - Type of resource (driver, booking, user, etc.)
 * @param {string} params.resourceId - ID of the affected resource
 * @param {string} params.resourceName - Human-readable name of the resource
 * @param {Object} params.changesMade - Before/after values
 * @param {string} params.reason - Optional reason for the change
 * @param {Object} params.metadata - Additional metadata
 */
export const logAdminAction = async ({
  action,
  resourceType,
  resourceId,
  resourceName = '',
  changesMade = null,
  reason = '',
  metadata = {}
}) => {
  try {
    // Get current admin user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('No authenticated user for audit log');
      return null;
    }
    
    // Get IP address (non-blocking)
    const ipPromise = getClientIP();
    const browserInfo = getBrowserInfo();
    
    // Create audit log entry
    const auditEntry = {
      // Timestamp
      timestamp: serverTimestamp(),
      timestampISO: new Date().toISOString(),
      
      // Action details
      action,
      actionLabel: getActionLabel(action),
      
      // Admin who performed the action
      adminEmail: currentUser.email,
      adminUid: currentUser.uid,
      adminDisplayName: currentUser.displayName || currentUser.email,
      
      // Resource affected
      resourceType,
      resourceId,
      resourceName,
      
      // Changes made (before/after)
      changesMade: changesMade ? {
        before: changesMade.before || null,
        after: changesMade.after || null,
        summary: generateChangeSummary(changesMade)
      } : null,
      
      // Optional reason
      reason: reason || null,
      
      // Technical details
      browser: browserInfo.browser,
      browserVersion: browserInfo.browserVersion,
      userAgent: browserInfo.userAgent,
      platform: browserInfo.platform,
      language: browserInfo.language,
      ipAddress: await ipPromise, // Wait for IP
      
      // Additional metadata
      metadata,
      
      // Search/filter helpers
      searchText: `${currentUser.email} ${action} ${resourceType} ${resourceName}`.toLowerCase(),
      dateOnly: new Date().toISOString().split('T')[0], // YYYY-MM-DD for filtering
    };
    
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'admin_audit_log'), auditEntry);
    
    console.log('✅ Admin action logged:', action, resourceType, resourceId);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to log admin action:', error);
    // Don't throw - logging should never break the app
    return null;
  }
};

/**
 * Get human-readable label for action type
 */
const getActionLabel = (action) => {
  const labels = {
    [AUDIT_ACTIONS.DRIVER_CREATED]: 'Driver Created',
    [AUDIT_ACTIONS.DRIVER_UPDATED]: 'Driver Updated',
    [AUDIT_ACTIONS.DRIVER_DELETED]: 'Driver Deleted',
    [AUDIT_ACTIONS.DRIVER_SCHEDULE_UPDATED]: 'Driver Schedule Updated',
    [AUDIT_ACTIONS.DRIVER_SERVICE_AREA_UPDATED]: 'Service Area Updated',
    [AUDIT_ACTIONS.DRIVER_STATUS_CHANGED]: 'Driver Status Changed',
    [AUDIT_ACTIONS.BOOKING_UPDATED]: 'Booking Updated',
    [AUDIT_ACTIONS.BOOKING_DELETED]: 'Booking Deleted',
    [AUDIT_ACTIONS.BOOKING_STATUS_CHANGED]: 'Booking Status Changed',
    [AUDIT_ACTIONS.BOOKING_ASSIGNED]: 'Booking Assigned',
    [AUDIT_ACTIONS.BOOKING_REASSIGNED]: 'Booking Reassigned',
    [AUDIT_ACTIONS.USER_CREATED]: 'User Created',
    [AUDIT_ACTIONS.USER_UPDATED]: 'User Updated',
    [AUDIT_ACTIONS.USER_DELETED]: 'User Deleted',
    [AUDIT_ACTIONS.USER_ROLE_CHANGED]: 'User Role Changed',
    [AUDIT_ACTIONS.SETTINGS_UPDATED]: 'Settings Updated',
    [AUDIT_ACTIONS.PRICING_UPDATED]: 'Pricing Updated',
    [AUDIT_ACTIONS.SERVICE_UPDATED]: 'Service Updated',
    [AUDIT_ACTIONS.ADMIN_LOGIN]: 'Admin Login',
    [AUDIT_ACTIONS.ADMIN_LOGOUT]: 'Admin Logout',
    [AUDIT_ACTIONS.DATA_EXPORT]: 'Data Export',
    [AUDIT_ACTIONS.BULK_OPERATION]: 'Bulk Operation',
  };
  
  return labels[action] || action;
};

/**
 * Generate a human-readable summary of changes
 */
const generateChangeSummary = (changesMade) => {
  if (!changesMade || !changesMade.before || !changesMade.after) {
    return 'Changes applied';
  }
  
  const changes = [];
  const before = changesMade.before;
  const after = changesMade.after;
  
  // Compare objects and find differences
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  
  allKeys.forEach(key => {
    const oldVal = before[key];
    const newVal = after[key];
    
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push(`${key}: "${oldVal}" → "${newVal}"`);
    }
  });
  
  return changes.length > 0 
    ? changes.join(', ') 
    : 'No changes detected';
};

/**
 * Convenience functions for common actions
 */

export const logDriverCreated = async (driverId, driverData) => {
  return logAdminAction({
    action: AUDIT_ACTIONS.DRIVER_CREATED,
    resourceType: 'driver',
    resourceId: driverId,
    resourceName: driverData.name || 'New Driver',
    changesMade: {
      after: driverData
    },
    metadata: {
      driverEmail: driverData.email,
      driverPhone: driverData.phone,
    }
  });
};

export const logDriverUpdated = async (driverId, driverName, oldData, newData, reason = '') => {
  return logAdminAction({
    action: AUDIT_ACTIONS.DRIVER_UPDATED,
    resourceType: 'driver',
    resourceId: driverId,
    resourceName: driverName,
    changesMade: {
      before: oldData,
      after: newData
    },
    reason
  });
};

export const logDriverDeleted = async (driverId, driverData) => {
  return logAdminAction({
    action: AUDIT_ACTIONS.DRIVER_DELETED,
    resourceType: 'driver',
    resourceId: driverId,
    resourceName: driverData.name || 'Deleted Driver',
    changesMade: {
      before: driverData
    },
    metadata: {
      driverEmail: driverData.email,
      driverPhone: driverData.phone,
    }
  });
};

export const logDriverScheduleUpdated = async (driverId, driverName, oldSchedule, newSchedule, reason = '') => {
  return logAdminAction({
    action: AUDIT_ACTIONS.DRIVER_SCHEDULE_UPDATED,
    resourceType: 'driver',
    resourceId: driverId,
    resourceName: driverName,
    changesMade: {
      before: { schedule: oldSchedule },
      after: { schedule: newSchedule }
    },
    reason
  });
};

export const logBookingUpdated = async (bookingId, oldData, newData, reason = '') => {
  return logAdminAction({
    action: AUDIT_ACTIONS.BOOKING_UPDATED,
    resourceType: 'booking',
    resourceId: bookingId,
    resourceName: `Booking #${bookingId.slice(-6)}`,
    changesMade: {
      before: oldData,
      after: newData
    },
    reason,
    metadata: {
      customerEmail: newData.email || oldData.email,
      customerName: newData.name || oldData.name,
    }
  });
};

export const logBookingStatusChanged = async (bookingId, customerName, oldStatus, newStatus, reason = '') => {
  return logAdminAction({
    action: AUDIT_ACTIONS.BOOKING_STATUS_CHANGED,
    resourceType: 'booking',
    resourceId: bookingId,
    resourceName: `Booking for ${customerName}`,
    changesMade: {
      before: { status: oldStatus },
      after: { status: newStatus }
    },
    reason
  });
};

export const logDataExport = async (exportType, recordCount) => {
  return logAdminAction({
    action: AUDIT_ACTIONS.DATA_EXPORT,
    resourceType: 'data',
    resourceId: exportType,
    resourceName: `${exportType} Export`,
    metadata: {
      recordCount,
      exportFormat: 'CSV',
    }
  });
};
