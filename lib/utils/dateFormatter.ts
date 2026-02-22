import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

/**
 * Converts a local date and time string into a strict UTC ISO string
 * based on the provided timezone string.
 * @param dateStr e.g. "2024-05-18"
 * @param timeStr e.g. "14:00"
 * @param timezone e.g. "Africa/Lagos"
 * @returns e.g. "2024-05-18T13:00:00.000Z"
 */
export function combineToUTCString(dateStr: string, timeStr: string, timezone: string): string {
    if (!dateStr || !timeStr || !timezone) return '';

    try {
        // Combine date and time locally
        const localDateTimeString = `${dateStr} ${timeStr}:00`;
        // Convert that local time in the specified timezone to a UTC Date object
        const utcDate = fromZonedTime(localDateTimeString, timezone);
        return utcDate.toISOString();
    } catch {
        return '';
    }
}

/**
 * Extracts the local date string (yyyy-MM-dd) from a UTC string using a specific timezone.
 * Useful for populating <input type="date"> during Edit modes.
 */
export function getLocalDateStringFromUTC(utcString: string, timezone: string): string {
    if (!utcString || !timezone) return '';
    try {
        return formatInTimeZone(new Date(utcString), timezone, 'yyyy-MM-dd');
    } catch {
        return '';
    }
}

/**
 * Extracts the local time string (HH:mm) from a UTC string using a specific timezone.
 * Useful for populating <input type="time"> during Edit modes.
 */
export function getLocalTimeStringFromUTC(utcString: string, timezone: string): string {
    if (!utcString || !timezone) return '';
    try {
        return formatInTimeZone(new Date(utcString), timezone, 'HH:mm');
    } catch {
        return '';
    }
}

/**
 * Converts a UTC string from the backend into a formatted local string 
 * for the user's current device timezone (For display in tables/details).
 */
export function formatUTCToLocal(utcString: string, formatStr: string = 'PP p'): string {
    if (!utcString) return '';
    try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return formatInTimeZone(new Date(utcString), userTimezone, formatStr);
    } catch {
        return new Date(utcString).toLocaleString();
    }
}
