"use client";

import { useEffect, useState, useMemo } from "react";
import { X, CheckCircle, Clock, XCircle, ChevronDown, Package, CalendarDays, List, ChevronLeft, ChevronRight } from "lucide-react";

// ---- Booking service type detection ----
// We classify each booking by whether it includes studio items, live, photographer, or edit bookings.
// Since backings may not yet include a `type` field, we infer from itemType + service category names.
function detectBookingType(booking: any): string {
    const items: any[] = booking.items || [];
    for (const item of items) {
        if (item.itemType === 'STUDIO') return 'studio';
        const catName: string = (item.service?.category?.name || '').toLowerCase();
        if (catName.includes('шууд') || catName.includes('live')) return 'live';
        if (catName.includes('эдит') || catName.includes('edit')) return 'edit';
        if (catName.includes('зурагла') || catName.includes('photo') || catName.includes('camera')) return 'photographer';
    }
    // fallback from booking.type if ever present
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
const MONTHS_MN = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Calendar state
    const today = new Date();
    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed

    const fetchBookings = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/bookings');
            if (res.ok) setBookings(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBookings(); }, []);

    const updateBookingStatus = async (status: string) => {
        if (!selectedBooking) return;
        setIsSaving(true);
        try {
            const res = await fetch(`http://localhost:4000/api/bookings/${selectedBooking.id}/status`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
            });
            if (res.ok) { await fetchBookings(); setSelectedBooking({ ...selectedBooking, status }); }
            else alert("Алдаа гарлаа.");
        } catch (e) { console.error(e); }
        finally { setIsSaving(false); }
    };

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(calYear, calMonth, 1);
        // Monday=0 based offset
        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < startOffset; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        // pad to full weeks
        while (days.length % 7 !== 0) days.push(null);
        return days;
    }, [calYear, calMonth]);

    // Map booking items to calendar dates
    const bookingsByDay = useMemo(() => {
        const map: Record<string, any[]> = {};
        for (const b of bookings) {
            const type = detectBookingType(b);
            const items: any[] = b.items || [];
            if (items.length === 0) {
                // fallback to createdAt
                const d = new Date(b.createdAt);
                if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
                    const key = d.getDate().toString();
                    map[key] = map[key] || [];
                    map[key].push({ ...b, _type: type });
                }
                continue;
            }
            for (const item of items) {
                const d = new Date(item.bookingDate || b.createdAt);
                if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
                    const key = d.getDate().toString();
                    map[key] = map[key] || [];
                    map[key].push({ ...b, _type: type });
                }
            }
        }
        return map;
    }, [bookings, calYear, calMonth]);

    const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
    const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

    return (
        <div className="space-y-6">
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
                    <button onClick={() => setView('calendar')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
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
                            const dayBookings: any[] = day !== null ? (bookingsByDay[day.toString()] || []) : [];
                            // deduplicate by booking id
                            const uniqueBookings = dayBookings.filter((b, idx, arr) => arr.findIndex(x => x.id === b.id) === idx);

                            return (
                                <div key={i} className={`min-h-[100px] p-2 ${day === null ? 'bg-muted/10' : 'hover:bg-muted/20 transition-colors'}`}>
                                    {day !== null && (
                                        <>
                                            <div className={`w-7 h-7 flex items-center justify-center text-sm font-medium mb-1 rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                                                {day}
                                            </div>
                                            <div className="space-y-0.5">
                                                {uniqueBookings.slice(0, 3).map((b, idx) => {
                                                    const col = TYPE_COLORS[b._type] || TYPE_COLORS.photographer;
                                                    return (
                                                        <button key={idx} onClick={() => setSelectedBooking(b)} className={`w-full text-left rounded px-1.5 py-0.5 text-xs truncate ${col.bg} ${col.text} hover:opacity-80 transition-opacity`}>
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
