import moment from 'moment';
import 'moment-timezone';
import 'moment-duration-format';

// Import supported locales
import 'moment/locale/en-gb';
import 'moment/locale/fr';
import 'moment/locale/es';
import 'moment/locale/de';
import 'moment/locale/zh-cn'; // Add more as needed

// Define supported locales
const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'hi']; // Add more as needed

/**
 * Configure Moment.js with a default locale and timezone
 * @param {string} locale - Locale code (e.g., 'en-gb', 'fr', 'es')
 * @param {string} timezone - Timezone (e.g., 'UTC', 'America/New_York')
 */
export const configureMoment = (locale: string = 'en', timezone: string = 'UTC') => {
    // Set locale (default to 'en')
    const resolvedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
    moment.locale(resolvedLocale);

    // Set default timezone (use device timezone if available)
    moment.tz.setDefault(timezone);
};

/**
 * Format a timestamp into relative time (e.g., "2 hours ago", "5 minutes ago", "3 seconds ago")
 * @param {string} timestamp - ISO date string
 * @returns {string} - Formatted relative time
 */
export const formatRelativeTime = (timestamp: string): string => {
    return moment(timestamp).fromNow(); // Example: "2 hours ago"
};

/**
 * Format a timestamp into a custom date format
 * @param {string} timestamp - ISO date string
 * @param {string} format - Moment.js date format (e.g., 'DD MMM YYYY, hh:mm A')
 * @returns {string} - Formatted date
 */
export const formatCustomDate = (timestamp: string, format: string = 'DD MMM YYYY, hh:mm A'): string => {
    return moment(timestamp).format(format); // Example: "18 Dec 2024, 04:32 PM"
};

/**
 * Get the time difference between the current time and the timestamp in a human-readable format
 * @param {string} timestamp - ISO date string
 * @returns {string} - Difference in human-readable format (e.g., "2 hours ago", "5 minutes ago", "3 seconds ago")
 */
export const getTimeAgo = (timestamp: string): string => {
    const now = moment(); // Get current time
    const timeAgo = moment(timestamp).fromNow(); // Format the timestamp in relative time

    return timeAgo; // This will return time like "2 minutes ago", "3 hours ago", etc.
};

/**
 * Get the difference in seconds, minutes, hours, or days.
 * @param {string} timestamp - ISO date string
 * @returns {string} - Time difference in seconds, minutes, hours, or days
 */
export const getTimeDifference = (timestamp: string): string => {
    const now = moment();
    const duration = moment.duration(now.diff(moment(timestamp))); // Get duration between now and the timestamp

    // Format based on the largest unit
    if (duration.asSeconds() < 60) {
        return `${Math.floor(duration.asSeconds())} seconds ago`;
    } else if (duration.asMinutes() < 60) {
        return `${Math.floor(duration.asMinutes())} minutes ago`;
    } else if (duration.asHours() < 24) {
        return `${Math.floor(duration.asHours())} hours ago`;
    } else if (duration.asDays() < 30) {
        return `${Math.floor(duration.asDays())} days ago`;
    } else if (duration.asMonths() < 12) {
        return `${Math.floor(duration.asMonths())} months ago`;
    } else {
        return `${Math.floor(duration.asYears())} years ago`;
    }
};
