const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type ServiceType = "STUDIO" | "LIVE_SERVICE" | "PHOTOGRAPHER_SERVICE" | "EDIT_SERVICE";

/**
 * Fetch the list of booked (busy) time strings for a given service & date.
 * Returns e.g. ["09:00", "10:00"]
 */
export async function fetchBookedSlots(
    serviceType: ServiceType,
    serviceId: number,
    date: string, // "YYYY-MM-DD"
): Promise<string[]> {
    try {
        const res = await fetch(
            `${API}/bookings/available-slots?serviceType=${serviceType}&serviceId=${serviceId}&date=${date}`
        );
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data.bookedTimes) ? data.bookedTimes : [];
    } catch {
        return [];
    }
}

// All standard booking time slots (full 24-hour range)
export const ALL_TIMES = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

/**
 * Check if a start time is disabled given:
 * - bookedTimes: list of busy time strings
 * - duration: hours of the package
 * A slot is disabled if ANY hour within [time, time+duration) is booked.
 */
export function isTimeDisabled(time: string, bookedTimes: string[], duration = 1): boolean {
    const [h] = time.split(":").map(Number);
    for (let i = 0; i < duration; i++) {
        const checkHour = h + i;
        const checkStr = `${String(checkHour).padStart(2, "0")}:00`;
        if (bookedTimes.includes(checkStr)) return true;
    }
    return false;
}
