
import { utils } from 'xlsx';

/**
 * Normalizes various date formats (Excel serial, US format, ISO) to YYYY-MM-DD
 */
export const parseCleanDate = (rawValue: any): string => {
    if (!rawValue) return '';

    // Handle Excel Serial Date (e.g., 45226)
    if (typeof rawValue === 'number') {
        // Excel base date is Dec 30, 1899
        const date = new Date(Math.round((rawValue - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }

    const strVal = String(rawValue).trim();

    // Handle "10/27/2023" or "2023-10-27"
    const date = new Date(strVal);
    if (!isNaN(date.getTime())) {
         return date.toISOString().split('T')[0];
    }

    return strVal; // Fallback to original string if parsing fails
};

/**
 * Normalizes time formats to HH:mm:ss (24h)
 */
export const parseCleanTime = (rawValue: any): string => {
    if (rawValue === undefined || rawValue === null || rawValue === '') return '';
    
    // Excel fraction of day (e.g. 0.5 = 12:00 PM)
    if (typeof rawValue === 'number') {
         let totalSeconds = Math.round(rawValue * 86400);
         const h = Math.floor(totalSeconds / 3600) % 24; // Ensure 0-23 range
         const m = Math.floor((totalSeconds % 3600) / 60);
         const s = totalSeconds % 60;
         return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    
    const strVal = String(rawValue).trim();
    
    // Convert "2:52:12 AM" to "02:52:12"
    if (strVal.match(/pm|am/i)) {
        const date = new Date(`1/1/2000 ${strVal}`);
        if (!isNaN(date.getTime())) {
             return date.toTimeString().split(' ')[0];
        }
    }
    
    return strVal;
};

/**
 * Helper to combine Date string (YYYY-MM-DD) and Time string (HH:mm:ss) into a Date object
 */
export const combineDateTime = (dateStr: string, timeStr: string): Date | null => {
    if (!dateStr || !timeStr) return null;
    // Handle cases where timeStr might just be "18:00" instead of "18:00:00"
    const cleanTime = timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr;
    const d = new Date(`${dateStr}T${cleanTime}`);
    if (isNaN(d.getTime())) return null;
    return d;
}

/**
 * Calculates difference in minutes between two timestamps
 */
export const calculateDiffMinutes = (start: Date, end: Date): number => {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    return (end.getTime() - start.getTime()) / 1000 / 60;
}
