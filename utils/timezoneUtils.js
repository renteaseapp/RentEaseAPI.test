/**
 * Timezone utilities for backend
 * Handles timezone conversion and date formatting for the server
 */

// Default timezone for the server (Thailand)
const DEFAULT_TIMEZONE = 'Asia/Bangkok';

/**
 * Get current date in server's timezone
 */
export const getCurrentDate = () => {
  return new Date();
};

/**
 * Get current date as ISO string
 */
export const getCurrentDateISO = () => {
  return new Date().toISOString();
};

/**
 * Convert date to server timezone and format as ISO string
 */
export const toServerTimezone = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  return dateObj.toISOString();
};

/**
 * Format date for display in server timezone
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  // Simple formatting for common patterns
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Get start of day for a given date
 */
export const startOfDay = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  dateObj.setHours(0, 0, 0, 0);
  return dateObj.toISOString();
};

/**
 * Get end of day for a given date
 */
export const endOfDay = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  dateObj.setHours(23, 59, 59, 999);
  return dateObj.toISOString();
};

/**
 * Get start of month for a given date
 */
export const startOfMonth = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  dateObj.setDate(1);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj.toISOString();
};

/**
 * Get end of month for a given date
 */
export const endOfMonth = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  dateObj.setMonth(dateObj.getMonth() + 1, 0);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj.toISOString();
};

/**
 * Add days to a date
 */
export const addDays = (date, days) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj.toISOString();
};

/**
 * Subtract days from a date
 */
export const subtractDays = (date, days) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  dateObj.setDate(dateObj.getDate() - days);
  return dateObj.toISOString();
};

/**
 * Check if a date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  return dateObj < new Date();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  return dateObj > new Date();
};

/**
 * Get timezone offset in minutes for the server
 */
export const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset();
};

/**
 * Parse date string and validate
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date string provided');
  }
  
  return dateObj.toISOString();
};

/**
 * Get date as YYYY-MM-DD format
 */
export const toDateString = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  return dateObj.toISOString().split('T')[0];
};

/**
 * Get date as YYYY-MM-DDTHH:mm format for datetime-local inputs
 */
export const toDateTimeLocalString = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  return dateObj.toISOString().slice(0, 16);
};

/**
 * Calculate difference in days between two dates
 */
export const diffInDays = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);
  
  if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const diffTime = Math.abs(dateObj2 - dateObj1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate difference in hours between two dates
 */
export const diffInHours = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);
  
  if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const diffTime = Math.abs(dateObj2 - dateObj1);
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  return diffHours;
};

/**
 * Get month name for a given date
 */
export const getMonthName = (date, locale = 'en') => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  return dateObj.toLocaleDateString(locale, { month: 'long' });
};

/**
 * Get day name for a given date
 */
export const getDayName = (date, locale = 'en') => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  return dateObj.toLocaleDateString(locale, { weekday: 'long' });
};

/**
 * Validate if a date string is valid
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  const dateObj = new Date(dateString);
  return !isNaN(dateObj.getTime());
};

/**
 * Get current timestamp
 */
export const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * Convert timestamp to ISO string
 */
export const timestampToISO = (timestamp) => {
  if (!timestamp) return null;
  
  const dateObj = new Date(timestamp);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid timestamp provided');
  }
  
  return dateObj.toISOString();
}; 