"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { X, CheckCircle, Clock, XCircle, ChevronDown, Package, CalendarDays, List, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

// ---- Booking service type detection ----
function detectBookingType(booking: any): string {
    const items: any[] = booking.items || [];
    for (const item of items) {
        if (item.itemType === 'STUDIO') return 'studio';
        const catName: string = (item.service?.category?.name || '').toLowerCase();
        if (catName.includes('шууд') || catName.includes('live')) return 'live';
        if (catName.includes('эдит') || catName.includes('edit')) return 'edit';
        if (catName.includes('зурагла') || catName.includes('photo') || catName.includes('camera')) return 'photographer';
    }
    const t = (booking.type || '').toLowerCase();
    if (t.includes('studio')) return 'studio';
    if (t.includes('live')) return 'live';
    if (t.includes('edit')) return 'edit';
    return 'photographer';
}

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    studio: { bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', label: 'Студио' },
    edit: { bg: 'bg-yellow-400/15', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-400', label: 'Эдит' },
    photographer: { bg: 'bg-slate-400/15', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', label: 'Зураглаач' },
    live: { bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400', dot: 'bg-pink-500', label: 'Шууд дамжуулалт' },
};

const WEEKDAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const WEEKDAYS_FULL = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'];
const MONTHS_MN = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];

// Hours displayed in day view
const DAY_HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 – 22:00

/** Get Monday of the week containing `date` */
function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Format short date like "3/2" */
function shortDate(d: Date) {
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Calendar state
    const today = new Date();
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());

    // Drill-down state
    const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'day'>('month');
    const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(null);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    // Animation
    const [animKey, setAnimKey] = useState(0);
    const [animDirection, setAnimDirection] = useState<'forward' | 'backward'>('forward');

    const triggerTransition = useCallback((direction: 'forward' | 'backward') => {
        setAnimDirection(direction);
        setAnimKey(k => k + 1);
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/bookings`);
            if (res.ok) setBookings(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBookings(); }, []);

    const updateBookingStatus = async (status: string) => {
        if (!selectedBooking) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`}/bookings/${selectedBooking.id}/status`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
            });
            if (res.ok) { await fetchBookings(); setSelectedBooking({ ...selectedBooking, status }); }
            else alert("Алдаа гарлаа.");
        } catch (e) { console.error(e); }
        finally { setIsSaving(false); }
    };

    // Build calendar grid (month view)
    const calendarDays = useMemo(() => {
        const firstDay = new Date(calYear, calMonth, 1);
        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < startOffset; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        while (days.length % 7 !== 0) days.push(null);
        return days;
    }, [calYear, calMonth]);

    // Bookings indexed by "YYYY-MM-DD" for efficient lookup
    const bookingsByDateKey = useMemo(() => {
        const map: Record<string, any[]> = {};
        for (const b of bookings) {
            const type = detectBookingType(b);
            const items: any[] = b.items || [];
            if (items.length === 0) {
                const d = new Date(b.createdAt);
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                map[key] = map[key] || [];
                map[key].push({ ...b, _type: type });
                continue;
            }
            for (const item of items) {
                const d = new Date(item.bookingDate || b.createdAt);
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                map[key] = map[key] || [];
                map[key].push({ ...b, _type: type, _item: item });
            }
        }
        return map;
    }, [bookings]);

    // Helper to get bookings for a specific date
    const getBookingsForDate = useCallback((date: Date) => {
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const found = bookingsByDateKey[key] || [];
        // deduplicate by booking id
        return found.filter((b, idx, arr) => arr.findIndex(x => x.id === b.id) === idx);
    }, [bookingsByDateKey]);

    // Week days array (7 dates starting from selectedWeekStart)
    const weekDays = useMemo(() => {
        if (!selectedWeekStart) return [];
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(selectedWeekStart);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [selectedWeekStart]);

    // Day view: bookings grouped by hour
    const dayBookingsByHour = useMemo(() => {
        if (!selectedDay) return {};
        const allBookings = getBookingsForDate(selectedDay);
        const map: Record<number, any[]> = {};
        for (const b of allBookings) {
            const item = b._item;
            if (item?.startTime) {
                const startHour = new Date(item.startTime).getHours();
                const endHour = item.endTime ? new Date(item.endTime).getHours() : startHour + 1;
                for (let h = startHour; h < endHour; h++) {
                    map[h] = map[h] || [];
                    if (!map[h].find((x: any) => x.id === b.id)) {
                        map[h].push(b);
                    }
                }
            } else {
                // No time info, put at 9am
                map[9] = map[9] || [];
                if (!map[9].find((x: any) => x.id === b.id)) {
                    map[9].push(b);
                }
            }
        }
        return map;
    }, [selectedDay, getBookingsForDate]);

    const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
    const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

    // Drill-down handlers
    const handleMonthDayClick = (day: number) => {
        const clickedDate = new Date(calYear, calMonth, day);
        const monday = getMonday(clickedDate);
        setSelectedWeekStart(monday);
        setCalendarMode('week');
        triggerTransition('forward');
    };

    const handleWeekDayClick = (date: Date) => {
        setSelectedDay(new Date(date));
        setCalendarMode('day');
        triggerTransition('forward');
    };

    const handleBackToMonth = () => {
        setCalendarMode('month');
        setSelectedWeekStart(null);
        setSelectedDay(null);
        triggerTransition('backward');
    };

    const handleBackToWeek = () => {
        setCalendarMode('week');
        setSelectedDay(null);
        triggerTransition('backward');
    };

    // Navigate week
    const prevWeek = () => {
        if (!selectedWeekStart) return;
        const d = new Date(selectedWeekStart);
        d.setDate(d.getDate() - 7);
        setSelectedWeekStart(d);
        triggerTransition('backward');
    };
    const nextWeek = () => {
        if (!selectedWeekStart) return;
        const d = new Date(selectedWeekStart);
        d.setDate(d.getDate() + 7);
        setSelectedWeekStart(d);
        triggerTransition('forward');
    };

    // Navigate day
    const prevDay = () => {
        if (!selectedDay) return;
        const d = new Date(selectedDay);
        d.setDate(d.getDate() - 1);
        setSelectedDay(d);
        triggerTransition('backward');
    };
    const nextDay = () => {
        if (!selectedDay) return;
        const d = new Date(selectedDay);
        d.setDate(d.getDate() + 1);
        setSelectedDay(d);
        triggerTransition('forward');
    };

    // CSS animation class based on direction
    const animClass = animDirection === 'forward' ? 'cal-slide-forward' : 'cal-slide-backward';

    return (
        <div className="space-y-6">
            {/* CSS for calendar transitions */}
            <style>{`
                @keyframes slideForward {
                    from { opacity: 0; transform: translateX(60px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideBackward {
                    from { opacity: 0; transform: translateX(-60px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .cal-slide-forward {
                    animation: slideForward 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .cal-slide-backward {
                    animation: slideBackward 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .cal-day-cell {
                    transition: background-color 0.15s ease, transform 0.15s ease;
                }
                .cal-day-cell:hover {
                    transform: scale(1.02);
                }
                .cal-hour-row {
                    transition: background-color 0.15s ease;
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Захиалгууд</h1>
                    <p className="text-muted-foreground mt-1">Системд бүртгэгдсэн бүх захиалгын жагсаалт ба удирдлага.</p>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1 self-start sm:self-auto">
                    <button onClick={() => setView('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                        <List className="w-4 h-4" /> Жагсаалт
                    </button>
                    <button onClick={() => { setView('calendar'); setCalendarMode('month'); setSelectedWeekStart(null); setSelectedDay(null); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                        <CalendarDays className="w-4 h-4" /> Календарь
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
                {Object.entries(TYPE_COLORS).map(([key, c]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        <span className="text-muted-foreground">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* ================= LIST VIEW ================= */}
            {view === 'list' && (
                <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium border-b">ID</th>
                                    <th className="px-6 py-4 font-medium border-b">Захиалагч</th>
                                    <th className="px-6 py-4 font-medium border-b">Төрөл</th>
                                    <th className="px-6 py-4 font-medium border-b">Нийт дүн</th>
                                    <th className="px-6 py-4 font-medium border-b">Огноо</th>
                                    <th className="px-6 py-4 font-medium border-b">Төлбөр</th>
                                    <th className="px-6 py-4 font-medium border-b">Төлөв</th>
                                    <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : bookings.length === 0 ? (<tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">Захиалга алга.</td></tr>)
                                        : bookings.map((booking) => {
                                            const btype = detectBookingType(booking);
                                            const col = TYPE_COLORS[btype];
                                            return (
                                                <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium">#{booking.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div>{booking.user?.username || 'Тодорхойгүй'}</div>
                                                        <div className="text-xs text-muted-foreground">{booking.user?.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${col.bg} ${col.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />{col.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">{Number(booking.totalAmount).toLocaleString()} ₮</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{new Date(booking.createdAt).toLocaleString('mn-MN')}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${booking.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500' : booking.paymentStatus === 'REFUNDED' ? 'bg-gray-500/10 text-gray-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                            {booking.paymentStatus === 'PAID' ? 'Төлөгдсөн' : booking.paymentStatus === 'REFUNDED' ? 'Буцаагдсан' : 'Хүлээгдэж буй'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${booking.status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-500' : booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                            {booking.status === 'CONFIRMED' ? 'Баталгаажсан' : booking.status === 'COMPLETED' ? 'Дууссан' : booking.status === 'CANCELLED' ? 'Цуцлагдсан' : 'Шалгагдаж буй'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => setSelectedBooking(booking)} className="text-sm text-primary hover:underline">Дэлгэрэнгүй</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ================= CALENDAR VIEW ================= */}
            {view === 'calendar' && (
                <div className="rounded-lg border border-border/50 bg-card overflow-hidden">

                    {/* ===== MONTH VIEW ===== */}
                    {calendarMode === 'month' && (
                        <div key={`month-${calYear}-${calMonth}-${animKey}`} className={animKey > 0 ? animClass : ''}>
                            {/* Month navigation */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                                <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                                <h2 className="font-semibold text-lg">{calYear} оны {MONTHS_MN[calMonth]}</h2>
                                <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronRight className="w-5 h-5" /></button>
                            </div>

                            {/* Weekday header */}
                            <div className="grid grid-cols-7 border-b border-border/50">
                                {WEEKDAYS.map(w => (
                                    <div key={w} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">{w}</div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 divide-x divide-y divide-border/30">
                                {calendarDays.map((day, i) => {
                                    const isToday = day !== null && day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                                    const dayDate = day !== null ? new Date(calYear, calMonth, day) : null;
                                    const uniqueBookings = dayDate ? getBookingsForDate(dayDate) : [];

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => day !== null && handleMonthDayClick(day)}
                                            className={`cal-day-cell min-h-[100px] p-2 ${day === null ? 'bg-muted/10' : 'hover:bg-muted/20 cursor-pointer'}`}
                                        >
                                            {day !== null && (
                                                <>
                                                    <div className={`w-7 h-7 flex items-center justify-center text-sm font-medium mb-1 rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                                                        {day}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        {uniqueBookings.slice(0, 3).map((b, idx) => {
                                                            const col = TYPE_COLORS[b._type] || TYPE_COLORS.photographer;
                                                            return (
                                                                <button key={idx} onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }} className={`w-full text-left rounded px-1.5 py-0.5 text-xs truncate ${col.bg} ${col.text} hover:opacity-80 transition-opacity`}>
                                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${col.dot} mr-1 align-middle`} />
                                                                    {b.user?.username || `#${b.id}`}
                                                                </button>
                                                            );
                                                        })}
                                                        {uniqueBookings.length > 3 && (
                                                            <p className="text-xs text-muted-foreground pl-1">+{uniqueBookings.length - 3} дахин</p>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ===== WEEK VIEW ===== */}
                    {calendarMode === 'week' && selectedWeekStart && (
                        <div key={`week-${selectedWeekStart.toISOString()}-${animKey}`} className={animClass}>
                            {/* Week navigation */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <button onClick={handleBackToMonth} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Сар</span>
                                    </button>
                                    <div className="w-px h-5 bg-border/50" />
                                    <button onClick={prevWeek} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                                </div>
                                <h2 className="font-semibold text-lg">
                                    {selectedWeekStart.getFullYear()} оны {MONTHS_MN[selectedWeekStart.getMonth()]} — {shortDate(selectedWeekStart)} ~ {shortDate(weekDays[6])}
                                </h2>
                                <button onClick={nextWeek} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronRight className="w-5 h-5" /></button>
                            </div>

                            {/* Weekday header */}
                            <div className="grid grid-cols-7 border-b border-border/50">
                                {weekDays.map((d, i) => {
                                    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                                    return (
                                        <div key={i} className="py-3 text-center">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{WEEKDAYS[i]}</div>
                                            <div className={`mt-1 w-8 h-8 mx-auto flex items-center justify-center text-sm font-bold rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                                                {d.getDate()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Week grid — taller cells for more detail */}
                            <div className="grid grid-cols-7 divide-x divide-border/30">
                                {weekDays.map((d, i) => {
                                    const dayBookings = getBookingsForDate(d);
                                    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => handleWeekDayClick(d)}
                                            className={`cal-day-cell min-h-[280px] p-3 cursor-pointer ${isToday ? 'bg-primary/5' : 'hover:bg-muted/20'}`}
                                        >
                                            <div className="space-y-1">
                                                {dayBookings.map((b, idx) => {
                                                    const col = TYPE_COLORS[b._type] || TYPE_COLORS.photographer;
                                                    const item = b._item;
                                                    const timeStr = item?.startTime
                                                        ? new Date(item.startTime).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
                                                        : '';
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                                                            className={`w-full text-left rounded-md px-2 py-1.5 text-xs ${col.bg} ${col.text} hover:opacity-80 transition-opacity`}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${col.dot} shrink-0`} />
                                                                <span className="font-medium truncate">{b.user?.username || `#${b.id}`}</span>
                                                            </div>
                                                            {timeStr && <div className="text-[10px] opacity-70 mt-0.5 pl-2.5">{timeStr}</div>}
                                                        </button>
                                                    );
                                                })}
                                                {dayBookings.length === 0 && (
                                                    <p className="text-xs text-muted-foreground/50 text-center mt-8">—</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ===== DAY VIEW ===== */}
                    {calendarMode === 'day' && selectedDay && (
                        <div key={`day-${selectedDay.toISOString()}-${animKey}`} className={animClass}>
                            {/* Day navigation */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <button onClick={handleBackToWeek} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Долоо хоног</span>
                                    </button>
                                    <div className="w-px h-5 bg-border/50" />
                                    <button onClick={prevDay} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                                </div>
                                <h2 className="font-semibold text-lg">
                                    {selectedDay.getFullYear()} оны {MONTHS_MN[selectedDay.getMonth()]} {selectedDay.getDate()} — {WEEKDAYS_FULL[selectedDay.getDay() === 0 ? 6 : selectedDay.getDay() - 1]}
                                </h2>
                                <button onClick={nextDay} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronRight className="w-5 h-5" /></button>
                            </div>

                            {/* Hourly schedule */}
                            <div className="divide-y divide-border/30">
                                {DAY_HOURS.map(hour => {
                                    const hourBookings = dayBookingsByHour[hour] || [];
                                    const isNow = today.getDate() === selectedDay.getDate() && today.getMonth() === selectedDay.getMonth() && today.getFullYear() === selectedDay.getFullYear() && today.getHours() === hour;
                                    return (
                                        <div key={hour} className={`cal-hour-row flex min-h-[60px] ${isNow ? 'bg-primary/5' : 'hover:bg-muted/10'}`}>
                                            {/* Time label */}
                                            <div className="w-20 shrink-0 flex items-start justify-end pr-4 pt-2">
                                                <span className={`text-xs font-medium ${isNow ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {hour.toString().padStart(2, '0')}:00
                                                </span>
                                            </div>
                                            <div className="border-l border-border/30 flex-1 p-2">
                                                <div className="space-y-1">
                                                    {hourBookings.map((b, idx) => {
                                                        const col = TYPE_COLORS[b._type] || TYPE_COLORS.photographer;
                                                        const item = b._item;
                                                        const startStr = item?.startTime
                                                            ? new Date(item.startTime).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
                                                            : '';
                                                        const endStr = item?.endTime
                                                            ? new Date(item.endTime).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
                                                            : '';
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setSelectedBooking(b)}
                                                                className={`w-full text-left rounded-md px-3 py-2 text-sm ${col.bg} ${col.text} hover:opacity-80 transition-opacity flex items-center justify-between`}
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className={`inline-block w-2 h-2 rounded-full ${col.dot} shrink-0`} />
                                                                    <span className="font-medium truncate">{b.user?.username || `#${b.id}`}</span>
                                                                    <span className="text-xs opacity-60">{col.label}</span>
                                                                </div>
                                                                {startStr && (
                                                                    <span className="text-xs opacity-70 shrink-0 ml-2">{startStr}{endStr ? ` – ${endStr}` : ''}</span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ================= DETAIL MODAL ================= */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-2xl rounded-lg border border-border/50 shadow-lg flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-border/50 p-6">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h2 className="text-xl font-semibold">Захиалгын дэлгэрэнгүй (#{selectedBooking.id})</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Огноо: {new Date(selectedBooking.createdAt).toLocaleString('mn-MN')}</p>
                                </div>
                                {(() => { const col = TYPE_COLORS[detectBookingType(selectedBooking)]; return (<span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${col.bg} ${col.text}`}><span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />{col.label}</span>); })()}
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="rounded-full p-2 hover:bg-muted/50 transition-colors"><X className="h-5 w-5 text-muted-foreground" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* User Info */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Захиалагчийн мэдээлэл</h3>
                                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-md border border-border/50">
                                    <div><p className="text-xs text-muted-foreground mb-1">Нэр</p><p className="font-medium">{selectedBooking.user?.username || 'Тодорхойгүй'}</p></div>
                                    <div><p className="text-xs text-muted-foreground mb-1">Утас</p><p className="font-medium">{selectedBooking.user?.phone || 'Байхгүй'}</p></div>
                                    <div className="col-span-2"><p className="text-xs text-muted-foreground mb-1">Имэйл</p><p className="font-medium">{selectedBooking.user?.email || 'Байхгүй'}</p></div>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Захиалсан зүйлс ({selectedBooking.items?.length || 0})</h3>
                                <div className="border border-border/50 rounded-md overflow-hidden bg-muted/10 divide-y divide-border/50">
                                    {selectedBooking.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 p-2 rounded-md h-fit"><Package className="w-4 h-4 text-primary" /></div>
                                                <div>
                                                    <p className="font-medium text-sm">{item.itemType === 'STUDIO' ? `Студи: ${item.studio?.name || 'Устгагдсан'}` : `Үйлчилгээ: ${item.service?.name || 'Устгагдсан'}`}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{new Date(item.bookingDate).toLocaleDateString('mn-MN')}</span>
                                                        {item.startTime && item.endTime && (<span>| {new Date(item.startTime).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}</span>)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{Number(item.totalPrice).toLocaleString()} ₮</p>
                                                <p className="text-xs text-muted-foreground">{item.quantity} x {Number(item.unitPrice).toLocaleString()} ₮</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedBooking.items || selectedBooking.items.length === 0) && (<div className="p-4 text-center text-sm text-muted-foreground">Хоосон байна</div>)}
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-md border border-border/50">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Төлбөрийн төлөв</p>
                                    <p className="font-semibold mt-1">{selectedBooking.paymentStatus === 'PAID' ? 'Төлөгдсөн' : selectedBooking.paymentStatus === 'REFUNDED' ? 'Буцаагдсан' : 'Төлөгдөөгүй'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-muted-foreground">Нийт төлбөр</p>
                                    <p className="text-xl font-bold text-primary">{Number(selectedBooking.totalAmount).toLocaleString()} ₮</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border/50 p-6 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-lg">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-sm font-medium whitespace-nowrap">Төлөв өөрчлөх:</span>
                                <div className="relative w-full sm:w-[180px]">
                                    <select className="w-full appearance-none bg-background border border-border/50 text-sm rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-primary" value={selectedBooking.status} disabled={isSaving} onChange={(e) => updateBookingStatus(e.target.value)}>
                                        <option value="PENDING">Шалгагдаж буй</option>
                                        <option value="CONFIRMED">Баталгаажсан</option>
                                        <option value="COMPLETED">Дууссан</option>
                                        <option value="CANCELLED">Цуцлагдсан</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                                {isSaving && <span className="text-xs text-muted-foreground animate-pulse">Уншиж байна...</span>}
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="w-full sm:w-auto px-4 py-2 border border-border/50 hover:bg-muted/50 rounded-md text-sm font-medium transition-colors">Хаах</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
