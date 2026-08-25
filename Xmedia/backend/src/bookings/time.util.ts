/**
 * Цагийн туслах функцүүд.
 *
 * Цагийг DB-д "HH:MM:SS" мөр (VarChar(8)) хэлбэрээр, ҮРГЭЛЖ 00:00:00–23:59:59
 * хооронд хадгална. Шөнө дамнасан захиалгыг (ж: 20:00–02:00) endTime <= startTime
 * гэдгээр нь таньж, үргэлжлэх хугацааг 24 цагийн модулиар тооцно.
 */

const MINUTES_PER_DAY = 1440;

/** "HH:MM" эсвэл "HH:MM:SS" → шөнө дундаас хойшхи минут. Хуучин "26:00:00" өгөгдлийг ч зөв уншина. */
export function toMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

/** Минут → нормчилсон "HH:MM:SS" (24 цагийн модулиар: 1560 → "02:00:00"). */
export function minutesToTime(minutes: number): string {
    const normalized = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/** "HH:MM", "HH:MM:SS" эсвэл "26:00:00" → нормчилсон "HH:MM:SS". */
export function normalizeTime(time: string): string {
    return minutesToTime(toMinutes(time));
}

/**
 * Шөнө дамнасныг тооцсон үргэлжлэх хугацаа (минутаар).
 * 20:00 → 02:00 = 360. Эхлэх ба дуусах цаг ижил бол 0 (буруу оролт).
 */
export function durationMinutes(start: string, end: string): number {
    return ((toMinutes(end) - toMinutes(start)) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Шөнө дамнасан эсэх (дуусах цаг нь дараагийн өдөрт хамаарах эсэх). */
export function isOvernight(start: string, end: string): boolean {
    return toMinutes(end) <= toMinutes(start);
}

/** 'YYYY-MM-DD' огноог өдрөөр шилжүүлнэ (цагийн бүсээс хамааралгүй). */
export function shiftDate(dateKey: string, days: number): string {
    const d = new Date(`${dateKey.slice(0, 10)}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}
