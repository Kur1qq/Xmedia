"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMinutes = toMinutes;
exports.minutesToTime = minutesToTime;
exports.normalizeTime = normalizeTime;
exports.durationMinutes = durationMinutes;
exports.isOvernight = isOvernight;
exports.shiftDate = shiftDate;
const MINUTES_PER_DAY = 1440;
function toMinutes(time) {
    if (!time)
        return 0;
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}
function minutesToTime(minutes) {
    const normalized = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}
function normalizeTime(time) {
    return minutesToTime(toMinutes(time));
}
function durationMinutes(start, end) {
    return ((toMinutes(end) - toMinutes(start)) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}
function isOvernight(start, end) {
    return toMinutes(end) <= toMinutes(start);
}
function shiftDate(dateKey, days) {
    const d = new Date(`${dateKey.slice(0, 10)}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}
//# sourceMappingURL=time.util.js.map