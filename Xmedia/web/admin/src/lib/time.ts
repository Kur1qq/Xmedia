/**
 * Цагийн туслах функцүүд (backend/src/bookings/time.util.ts-тэй ижил логик).
 *
 * Цаг нь "HH:MM" / "HH:MM:SS" мөр бөгөөд огноогүй тул шөнө дамнасан захиалгыг
 * (ж: 20:00–02:00) мөрөөр харьцуулж болохгүй — үргэлж минут болгож,
 * үргэлжлэх хугацааг 24 цагийн модулиар тооцно.
 */

const MINUTES_PER_DAY = 1440;

/** "HH:MM" эсвэл "HH:MM:SS" → шөнө дундаас хойшхи минут. */
export function toMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

/**
 * Шөнө дамнасныг тооцсон үргэлжлэх хугацаа (минутаар).
 * 20:00 → 02:00 = 360. Эхлэх ба дуусах цаг ижил бол 0 (буруу оролт).
 */
export function durationMinutes(start: string, end: string): number {
    return ((toMinutes(end) - toMinutes(start)) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Шөнө дамнасан эсэх (дуусах цаг дараагийн өдөрт хамаарах эсэх). */
export function isOvernight(start: string, end: string): boolean {
    if (!start || !end) return false;
    return toMinutes(end) <= toMinutes(start);
}

/** 'YYYY-MM-DD' огноог өдрөөр шилжүүлнэ (цагийн бүсээс хамааралгүй). */
export function shiftDateKey(dateKey: string, days: number): string {
    const d = new Date(`${dateKey.slice(0, 10)}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

/**
 * Захиалгыг абсолют минутын [start, end) интервал болгоно.
 * Ингэснээр өөр өдрийн захиалгуудыг ч зөв харьцуулж чадна.
 */
export function toSpan(dateKey: string, start: string, end: string): { start: number; end: number } {
    const base = Date.parse(`${dateKey.slice(0, 10)}T00:00:00Z`) / 60000;
    const s = base + toMinutes(start);
    return { start: s, end: s + durationMinutes(start, end) };
}

/**
 * "HH:MM[:SS]" → 24 цагийн модулиар нормчилсон "HH:MM".
 * Хуучин өгөгдөлд үлдсэн "26:00:00" мэтийг ч "02:00" болгож харуулна.
 */
export function toClock(time?: string | null): string {
    if (!time) return '';
    const total = toMinutes(time) % MINUTES_PER_DAY;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Цагийг харуулах: "20:00 – 02:00 (+1 өдөр)" */
export function formatTimeRange(start?: string | null, end?: string | null): string {
    if (!start) return '';
    const s = toClock(start);
    if (!end) return s;
    const e = toClock(end);
    return `${s} – ${e}${isOvernight(s, e) ? ' (+1 өдөр)' : ''}`;
}
