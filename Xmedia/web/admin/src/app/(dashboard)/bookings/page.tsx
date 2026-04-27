"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { X, CheckCircle, Clock, XCircle, ChevronDown, Package, CalendarDays, List, ChevronLeft, ChevronRight, ArrowLeft, User, CreditCard, Activity, Calendar, Edit2, Trash2, Mail, MoreVertical, Download } from "lucide-react";
import { toast } from "sonner";
import { getAdminInfo } from "@/lib/auth";
import * as xlsx from "xlsx";

// ---- Booking service type detection ----
function detectBookingType(booking: any): string {
    const items: any[] = booking.items || [];
    for (const item of items) {
        if (item.itemType === 'STUDIO') return 'studio';
        if (item.itemType === 'LIVE_SERVICE') return 'live';
        if (item.itemType === 'EDIT_SERVICE') return 'edit';
        if (item.itemType === 'PHOTOGRAPHER_SERVICE') return 'photographer';
        if (item.itemType === 'BUNDLE_SERVICE') return 'bundle';

        // Legacy fallback for generic 'SERVICE' ItemType
        const catName: string = (item.service?.category?.name || '').toLowerCase();
        if (catName.includes('шууд') || catName.includes('live')) return 'live';
        if (catName.includes('эдит') || catName.includes('edit')) return 'edit';
        if (catName.includes('зурагла') || catName.includes('photo') || catName.includes('camera')) return 'photographer';
    }

    // Default fallback
    return 'photographer';
}

function getBookingTitle(booking: any): string {
    const item = booking.items?.[0];
    if (!item) return `Захиалга #${booking.id}`;

    switch (item.itemType) {
        case 'STUDIO': return `Студи: ${item.studio?.name || '(Нэргүй)'}`;
        case 'LIVE_SERVICE': return `Шууд дамжуулалт: ${item.liveService?.name || '(Нэргүй)'}`;
        case 'EDIT_SERVICE': return `Эдит: ${item.editService?.name || '(Нэргүй)'}`;
        case 'PHOTOGRAPHER_SERVICE': return `Зураглаач: ${item.photographerService?.name || '(Нэргүй)'}`;
        case 'BUNDLE_SERVICE': return `Багц: ${item.bundleService?.name || '(Нэргүй)'}`;
        default: return `Үйлчилгээ: ${item.service?.name || '(Нэргүй)'}`;
    }
}

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    studio: { bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', label: 'Студио' },
    edit: { bg: 'bg-yellow-400/15', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-400', label: 'Эдит' },
    photographer: { bg: 'bg-slate-400/15', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400', label: 'Зураглаач' },
    live: { bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400', dot: 'bg-pink-500', label: 'Шууд дамжуулалт' },
    bundle: { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500', label: 'Багц' },
};

const WEEKDAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const WEEKDAYS_FULL = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'];
const MONTHS_MN = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];

// Hours displayed in day view
const DAY_HOURS = Array.from({ length: 24 }, (_, i) => i); // 00:00 – 23:00

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
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [cancelledBookings, setCancelledBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
    const [tab, setTab] = useState<'paid' | 'pending' | 'cancelled'>('paid');
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [newNoteText, setNewNoteText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Add / Edit Manual Booking state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editBookingId, setEditBookingId] = useState<number | null>(null);
    const [addForm, setAddForm] = useState({
        name: '', phone: '', email: '',
        date: shortDate(new Date()) ? new Date().toISOString().split('T')[0] : '',
        startTime: '10:00', endTime: '12:00',
        serviceType: 'STUDIO', serviceId: '',
        totalAmount: 100000, status: 'CONFIRMED', paymentStatus: 'PAID', notes: ''
    });
    const [serviceOptions, setServiceOptions] = useState<{ id: string; name: string }[]>([]);
    const [serviceOptionsLoading, setServiceOptionsLoading] = useState(false);
    const [timeConflict, setTimeConflict] = useState<string | null>(null);
    const [adminBookedSlots, setAdminBookedSlots] = useState<string[]>([]);

    // 30-min interval time slots
    const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
        const h = Math.floor(i / 2).toString().padStart(2, '00');
        const m = i % 2 === 0 ? '00' : '30';
        return `${h}:${m}`;
    });

    const SERVICE_TYPE_MAP: Record<string, string> = {
        STUDIO: 'STUDIO',
        PHOTOGRAPHER_SERVICE: 'PHOTOGRAPHER_SERVICE',
        EDIT_SERVICE: 'EDIT_SERVICE',
        LIVE_SERVICE: 'LIVE_SERVICE',
        BUNDLE_SERVICE: 'BUNDLE_SERVICE',
    };

    const fetchAdminBookedSlots = async (serviceType: string, serviceId: string, date: string) => {
        if (!serviceId || !date || !serviceType) { setAdminBookedSlots([]); return; }
        try {
            const res = await fetch(`${API}/bookings/available-slots?serviceType=${SERVICE_TYPE_MAP[serviceType] || serviceType}&serviceId=${serviceId}&date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setAdminBookedSlots(Array.isArray(data.bookedTimes) ? data.bookedTimes : []);
            } else {
                setAdminBookedSlots([]);
            }
        } catch { setAdminBookedSlots([]); }
    };

    const SERVICE_TYPE_ENDPOINTS: Record<string, string> = {
        STUDIO: 'studio',
        PHOTOGRAPHER_SERVICE: 'photographer-services',
        EDIT_SERVICE: 'edit-services',
        LIVE_SERVICE: 'live-services',
        BUNDLE_SERVICE: 'bundle-services',
    };

    const fetchServiceOptions = async (type: string) => {
        const endpoint = SERVICE_TYPE_ENDPOINTS[type];
        if (!endpoint) { setServiceOptions([]); return; }
        setServiceOptionsLoading(true);
        setServiceOptions([]);
        try {
            const res = await fetch(`${API}/${endpoint}`);
            if (res.ok) {
                const data: any[] = await res.json();
                const opts = data.map(s => ({ id: String(s.id), name: s.name || `#${s.id}` }));
                setServiceOptions(opts);
                setAddForm(f => ({ ...f, serviceId: opts[0]?.id || '' }));
            }
        } catch (e) { console.error(e); setServiceOptions([]); }
        finally { setServiceOptionsLoading(false); }
    };

    // Fetch services when modal opens or serviceType changes
    useEffect(() => {
        if (isAddModalOpen) {
            fetchServiceOptions(addForm.serviceType);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAddModalOpen, addForm.serviceType]);

    // Fetch booked slots when date / service selection changes
    useEffect(() => {
        if (isAddModalOpen && addForm.date && addForm.serviceId) {
            fetchAdminBookedSlots(addForm.serviceType, addForm.serviceId, addForm.date);
        } else {
            setAdminBookedSlots([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAddModalOpen, addForm.date, addForm.serviceId, addForm.serviceType]);

    const openBookingModal = (b: any, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedBooking(b);
        setNewNoteText("");
    };

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

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    const fetchBookings = async () => {
        try {
            const [paidRes, pendingRes, cancelledRes] = await Promise.all([
                fetch(`${API}/bookings`),
                fetch(`${API}/bookings/pending`),
                fetch(`${API}/bookings/cancelled`),
            ]);
            if (paidRes.ok) setBookings(await paidRes.json());
            if (pendingRes.ok) setPendingBookings(await pendingRes.json());
            if (cancelledRes.ok) setCancelledBookings(await cancelledRes.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBookings(); }, []);

    // Current tab's bookings
    const activeBookings = tab === 'paid' ? bookings : tab === 'pending' ? pendingBookings : cancelledBookings;

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

    const updatePaymentStatus = async (paymentStatus: string) => {
        if (!selectedBooking) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/bookings/${selectedBooking.id}/payment-status`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus }),
            });
            if (res.ok) { await fetchBookings(); setSelectedBooking({ ...selectedBooking, paymentStatus }); }
            else alert("Алдаа гарлаа.");
        } catch (e) { console.error(e); }
        finally { setIsSaving(false); }
    };

    const updateBookingNotes = async () => {
        if (!selectedBooking || !newNoteText.trim()) return;
        setIsSaving(true);
        try {
            const admin = getAdminInfo();
            const adminName = admin?.username || "Админ";
            const dateStr = new Date().toLocaleString('mn-MN');

            const appendedNote = `\n\n--- ${dateStr} [${adminName}] ---\n${newNoteText.trim()}`;
            const updatedNotes = (selectedBooking.notes || "") + appendedNote;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/bookings/${selectedBooking.id}/notes`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: updatedNotes }),
            });
            if (res.ok) {
                await fetchBookings();
                setSelectedBooking({ ...selectedBooking, notes: updatedNotes });
                setNewNoteText("");
                toast.success("Тэмдэглэл нэмэгдлээ");
            }
            else toast.error("Алдаа гарлаа.");
        } catch (e) { console.error(e); }
        finally { setIsSaving(false); }
    };

    const submitManualBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setTimeConflict(null);

        // Studio overlap check using already-loaded bookings
        if (addForm.serviceType === 'STUDIO' && addForm.serviceId && addForm.date && addForm.startTime && addForm.endTime) {
            const newStart = addForm.startTime;
            const newEnd = addForm.endTime;
            if (newStart >= newEnd) {
                setTimeConflict('Эхлэх цаг дуусах цагаас өмнө байх ёстой.');
                return;
            }
            const dateKey = addForm.date;
            const dayBookings = bookingsByDateKey[dateKey] || [];
            const studioId = String(addForm.serviceId);
            const conflicts = dayBookings.filter(b => {
                if (modalMode === 'edit' && b.id === editBookingId) return false;
                const bItem = b._item;
                if (!bItem || b._type !== 'studio') return false;
                if (String(bItem.studioId ?? bItem.studio?.id) !== studioId) return false;
                const bs = bItem.startTime?.slice(0, 5);
                const be = bItem.endTime?.slice(0, 5);
                if (!bs || !be) return false;
                // Overlap: new.start < existing.end && new.end > existing.start
                return newStart < be && newEnd > bs;
            });
            if (conflicts.length > 0) {
                const c = conflicts[0];
                const bs = c._item.startTime.slice(0, 5);
                const be = c._item.endTime.slice(0, 5);
                setTimeConflict(`Цаг давхцалдаа: ${bs}–${be} цагт #${c.id} захиалга буй байна.`);
                return;
            }
        }

        if (modalMode === 'edit' && editBookingId) {
            setIsSaving(true);
            try {
                const token = localStorage.getItem('admin_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/bookings/admin/${editBookingId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(addForm),
                });
                if (res.ok) {
                    toast.success("Амжилттай шинэчлэгдлээ");
                    await fetchBookings();
                    setIsAddModalOpen(false);
                } else {
                    const err = await res.json();
                    toast.error(`Алдаа гарлаа: ${err.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error(error);
                toast.error("Холболтын алдаа гарлаа.");
            } finally {
                setIsSaving(false);
            }
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/bookings/admin/manual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(addForm),
            });
            if (res.ok) {
                toast.success("Амжилттай нэмэгдлээ");
                await fetchBookings();
                setIsAddModalOpen(false);
            } else {
                const err = await res.json();
                toast.error(`Алдаа гарлаа: ${err.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Холболтын алдаа гарлаа.");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteSelectedBooking = async () => {
        if (!selectedBooking) return;
        if (!confirm(`Tа #${selectedBooking.id} захиалгыг бүр мөсөн устгахдаа итгэлтэй байна уу?`)) return;
        
        setIsSaving(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API}/bookings/${selectedBooking.id}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                toast.success("Амжилттай устгагдлаа");
                setSelectedBooking(null);
                await fetchBookings();
            } else {
                toast.error("Устгахад алдаа гарлаа");
            }
        } catch (e) {
            console.error(e);
            toast.error("Холболтын алдаа гарлаа.");
        } finally {
            setIsSaving(false);
        }
    };

    const openEditModal = () => {
        if (!selectedBooking) return;
        const b = selectedBooking;
        const item = b.items?.[0] || {};
        
        let sType = 'STUDIO';
        let sId = '';
        if (item.studioId) { sType = 'STUDIO'; sId = String(item.studioId); }
        else if (item.liveServiceId) { sType = 'LIVE_SERVICE'; sId = String(item.liveServiceId); }
        else if (item.photographerServiceId) { sType = 'PHOTOGRAPHER_SERVICE'; sId = String(item.photographerServiceId); }
        else if (item.editServiceId) { sType = 'EDIT_SERVICE'; sId = String(item.editServiceId); }
        else if (item.bundleServiceId) { sType = 'BUNDLE_SERVICE'; sId = String(item.bundleServiceId); }
        
        setAddForm({
            name: b.user?.username || '',
            phone: b.user?.phone || '',
            email: b.user?.email || '',
            date: item.bookingDate || shortDate(new Date()) ? new Date().toISOString().split('T')[0] : '',
            startTime: item.startTime ? item.startTime.slice(0,5) : '10:00',
            endTime: item.endTime ? item.endTime.slice(0,5) : '12:00',
            serviceType: sType,
            serviceId: sId,
            totalAmount: Number(b.totalAmount) || 0,
            status: b.status || 'PENDING',
            paymentStatus: b.paymentStatus || 'UNPAID',
            notes: b.notes || '',
        });
        
        setModalMode('edit');
        setEditBookingId(b.id);
        setIsAddModalOpen(true);
        setSelectedBooking(null);
    };

    const downloadExcel = () => {
        if (!filteredBookings || filteredBookings.length === 0) {
            toast.error("Татах өгөгдөл алга байна.");
            return;
        }

        const excelData = filteredBookings.map((booking, index) => {
            const btype = detectBookingType(booking);
            let serviceLabel = "Үйлчилгээ";
            if (btype === 'studio') serviceLabel = "Студио";
            if (btype === 'live') serviceLabel = "Шууд дамжуулалт";
            if (btype === 'edit') serviceLabel = "Эдит";
            if (btype === 'bundle') serviceLabel = "Багц үйлчилгээ";
            if (btype === 'photographer') serviceLabel = "Зурагчин, Зураглаач";

            return {
                "№": index + 1,
                "Захиалгын ID": `#${booking.id}`,
                "Үйлчилгээний Төрөл": serviceLabel,
                "Хэрэглэгч": booking.user?.username || 'Тодорхойгүй',
                "И-Мэйл": booking.user?.email || '',
                "Утас": booking.user?.phone || '',
                "Нийт дүн": `${Number(booking.totalAmount).toLocaleString()}`,
                "Төлбөрийн Төлөв": booking.paymentStatus === 'PAID' ? 'Төлөгдсөн' : booking.paymentStatus === 'REFUNDED' ? 'Буцаагдсан' : 'Хүлээгдэж буй',
                "Захиалгын Төлөв": booking.status === 'CONFIRMED' ? 'Баталгаажсан' : booking.status === 'COMPLETED' ? 'Дууссан' : booking.status === 'CANCELLED' ? 'Цуцлагдсан' : 'Шалгагдаж буй',
                "Үүсгэсэн Огноо": new Date(booking.createdAt).toLocaleString('mn-MN')
            };
        });

        const worksheet = xlsx.utils.aoa_to_sheet([
            ["ХЯНАЛТЫН САМБАР - ЗАХИАЛГЫН ТАЙЛАН"],
            [`Төлөв: ${tab === 'paid' ? 'Төлөгдсөн' : tab === 'pending' ? 'Хүлээгдэж буй' : 'Цуцлагдсан'}`],
            [""]
        ]);

        xlsx.utils.sheet_add_json(worksheet, excelData, { origin: "A4", skipHeader: false });

        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Захиалгууд");
        
        const pad = (n: number) => n.toString().padStart(2, '0');
        const d = new Date();
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        
        xlsx.writeFile(workbook, `Zahialga_Tailan_${dateStr}.xlsx`);
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

    // Helper: parse "HH:MM:SS" string → hour number
    const parseTimeStrHour = (timeStr: string): number => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        return parseInt(parts[0], 10) || 0;
    };

    // Filtered bookings (by service type when a filter is active)
    const filteredBookings = useMemo(() => {
        if (!activeTypeFilter) return activeBookings;
        return activeBookings.filter(b => detectBookingType(b) === activeTypeFilter);
    }, [activeBookings, activeTypeFilter]);

    // Bookings indexed by "YYYY-MM-DD" for efficient lookup
    const bookingsByDateKey = useMemo(() => {
        const map: Record<string, any[]> = {};
        for (const b of filteredBookings) {
            const type = detectBookingType(b);
            const items: any[] = b.items || [];
            if (items.length === 0) {
                const d = new Date(b.createdAt);
                // Use zero-padded key to match getBookingsForDate
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                map[key] = map[key] || [];
                map[key].push({ ...b, _type: type });
                continue;
            }
            for (const item of items) {
                // bookingDate is stored as 'YYYY-MM-DD' string in DB
                const rawDate: string = item.bookingDate || '';
                let key: string;
                if (rawDate && rawDate.length >= 10) {
                    // Use directly — already 'YYYY-MM-DD'
                    key = rawDate.slice(0, 10);
                } else {
                    const d = new Date(b.createdAt);
                    key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                }
                map[key] = map[key] || [];
                map[key].push({ ...b, _type: type, _item: item });
            }
        }
        return map;
    }, [filteredBookings]);

    // Helper to get bookings for a specific date
    const getBookingsForDate = useCallback((date: Date) => {
        // Build zero-padded key matching the map above
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
                // startTime is stored as "HH:MM:SS" string — parse directly
                const startHour = parseTimeStrHour(item.startTime);
                const endHour = item.endTime ? parseTimeStrHour(item.endTime) : startHour + 1;
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
                    <p className="text-muted-foreground mt-1">Зөвхөн төлбөр төлсөн захиалгууд харагдана.</p>
                </div>

                {/* Actions & View toggle */}
                <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                    <button
                        onClick={downloadExcel}
                        className="border border-input bg-background hover:bg-muted text-foreground flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Excel татах
                    </button>
                    <button
                        onClick={() => {
                            setModalMode('add');
                            setAddForm({
                                name: '', phone: '', email: '',
                                date: shortDate(new Date()) ? new Date().toISOString().split('T')[0] : '',
                                startTime: '10:00', endTime: '12:00',
                                serviceType: 'STUDIO', serviceId: '',
                                totalAmount: 100000, status: 'CONFIRMED', paymentStatus: 'PAID', notes: ''
                            });
                            setIsAddModalOpen(true);
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                    >
                        + Захиалга нэмэх
                    </button>
                    <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
                        <button onClick={() => setView('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                            <List className="w-4 h-4" /> Жагсаалт
                        </button>
                        <button onClick={() => { setView('calendar'); setCalendarMode('month'); setSelectedWeekStart(null); setSelectedDay(null); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                            <CalendarDays className="w-4 h-4" /> Календарь
                        </button>
                    </div>
                </div>
            </div>

            {/* Service type filter buttons */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(TYPE_COLORS).map(([key, c]) => {
                    const isActive = activeTypeFilter === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTypeFilter(isActive ? null : key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                isActive
                                    ? `${c.bg} ${c.text} border-transparent shadow-sm`
                                    : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border bg-transparent'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                            {c.label}
                        </button>
                    );
                })}
                {activeTypeFilter && (
                    <button
                        onClick={() => setActiveTypeFilter(null)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-3 h-3" /> Бүгд
                    </button>
                )}
            </div>

            {/* Payment status tabs */}
            <div className="flex items-center gap-1 self-start rounded-lg border border-border/50 bg-muted/30 p-1">
                <button
                    onClick={() => setTab('paid')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'paid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Төлөсөн
                    {bookings.length > 0 && <span className="ml-1 bg-green-500/20 text-green-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{bookings.length}</span>}
                </button>
                <button
                    onClick={() => setTab('pending')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'pending' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Clock className="w-4 h-4 text-yellow-500" />
                    Нэхэмжлэл хүлээж буй
                    {pendingBookings.length > 0 && <span className="ml-1 bg-yellow-500/20 text-yellow-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingBookings.length}</span>}
                </button>
                <button
                    onClick={() => setTab('cancelled')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'cancelled' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <X className="w-4 h-4 text-red-500" />
                    Цуцлагдсан
                    {cancelledBookings.length > 0 && <span className="ml-1 bg-red-500/20 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{cancelledBookings.length}</span>}
                </button>
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
                                    : activeBookings.length === 0 ? (<tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">{tab === 'paid' ? 'Төлөгдсөн захиалга алга.' : tab === 'pending' ? 'Нэхэмжлэл хүлээж буй захиалга алга.' : 'Цуцлагдсан захиалга алга.'}</td></tr>)
                                        : activeBookings.map((booking) => {
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
                                                        <button onClick={(e) => openBookingModal(booking, e)} className="text-sm text-primary hover:underline">Дэлгэрэнгүй</button>
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
                                                            const isCompleted = b.status === 'COMPLETED';
                                                            const col = isCompleted
                                                                ? { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' }
                                                                : (TYPE_COLORS[b._type] || TYPE_COLORS.photographer);
                                                            return (
                                                                <button key={idx} onClick={(e) => openBookingModal(b, e)} className={`w-full text-left rounded px-1.5 py-0.5 text-xs truncate ${col.bg} ${col.text} hover:opacity-80 transition-opacity`}>
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
                                                    const isCompleted = b.status === 'COMPLETED';
                                                    const col = isCompleted
                                                        ? { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' }
                                                        : (TYPE_COLORS[b._type] || TYPE_COLORS.photographer);
                                                    const item = b._item;
                                                    // startTime is "HH:MM:SS" string — display first 5 chars
                                                    const timeStr = item?.startTime
                                                        ? item.startTime.slice(0, 5)
                                                        : '';
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={(e) => openBookingModal(b, e)}
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
                                    const isNow = today.getDate() === selectedDay.getDate() && today.getMonth() === selectedDay.getMonth() && today.getFullYear() === today.getFullYear() && today.getHours() === hour;
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
                                                        const isCompleted = b.status === 'COMPLETED';
                                                        const col = isCompleted
                                                            ? { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400', label: 'Дууссан' }
                                                            : (TYPE_COLORS[b._type] || TYPE_COLORS.photographer);
                                                        const item = b._item;
                                                        // startTime/endTime are "HH:MM:SS" strings
                                                        const startStr = item?.startTime ? item.startTime.slice(0, 5) : '';
                                                        const endStr = item?.endTime ? item.endTime.slice(0, 5) : '';
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={(e) => openBookingModal(b, e)}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Shadow backdrop to close on click outside */}
                    <div className="absolute inset-0 pointer-events-auto bg-black/60" onClick={() => setSelectedBooking(null)}></div>

                    <div
                        className="relative bg-[#1e1e1e] w-full max-w-[420px] rounded-[16px] shadow-2xl flex flex-col z-10 pt-1 pb-4 border border-white/5 pointer-events-auto overflow-hidden"
                        style={{
                            maxHeight: 'calc(100vh - 32px)'
                        }}
                    >
                        {/* Top Actions */}
                        <div className="flex justify-end items-center gap-1.5 px-3 py-2 text-gray-400">
                            <button onClick={openEditModal} className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={deleteSelectedBooking} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors">
                                <Mail className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors ml-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 space-y-5 custom-scrollbar pb-2">
                            {/* Header row: Dot + Title */}
                            <div className="flex gap-4">
                                <div className="pt-1.5 flex-shrink-0">
                                    <div className={`w-3.5 h-3.5 rounded-[3px] ${TYPE_COLORS[detectBookingType(selectedBooking)]?.dot || 'bg-gray-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-[22px] font-normal text-white leading-tight mb-1 cursor-text select-text">
                                        {getBookingTitle(selectedBooking)}
                                    </h2>
                                    <div className="text-[13px] text-gray-300 tracking-wide mt-1.5">
                                        {selectedBooking.items?.[0]?.bookingDate
                                            ? (() => {
                                                const d = new Date(selectedBooking.items[0].bookingDate + 'T00:00:00');
                                                const days = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
                                                return `${d.getMonth() + 1}-р сарын ${d.getDate()}, ${days[d.getDay()]} гараг`;
                                              })()
                                            : ''}
                                        {selectedBooking.items?.[0]?.startTime && (
                                            <span>
                                                {' '}•{' '}
                                                {selectedBooking.items[0].startTime.slice(0, 5)} – {selectedBooking.items[0].endTime?.slice(0, 5) || ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Details (aligned left with the title text, so we use pl-[30px] or just flex gap-4) */}
                            <div className="space-y-4">

                                {/* User Info */}
                                <div className="flex items-start gap-4">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="text-sm text-gray-300">
                                        <div className="text-white mb-0.5">{selectedBooking.user?.username || 'Тодорхойгүй'}</div>
                                        <div className="text-gray-400">
                                            {selectedBooking.user?.phone ? `${selectedBooking.user.phone} • ` : ''}{selectedBooking.user?.email || 'Имэйлгүй'}
                                        </div>
                                    </div>
                                </div>

                                {/* Price / Payment */}
                                <div className="flex items-start gap-4">
                                    <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="text-sm flex flex-col gap-0.5">
                                        <span className="text-white font-medium">{Number(selectedBooking.totalAmount).toLocaleString()} ₮</span>
                                        <div className="flex items-center">
                                            <select
                                                className="appearance-none bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 rounded px-1 -ml-1 py-0.5 text-xs font-semibold focus:outline-none cursor-pointer transition-colors"
                                                style={{ color: selectedBooking.paymentStatus === 'PAID' ? '#4ade80' : selectedBooking.paymentStatus === 'UNPAID' ? '#f87171' : '#facc15' }}
                                                value={selectedBooking.paymentStatus}
                                                disabled={isSaving}
                                                onChange={(e) => updatePaymentStatus(e.target.value)}
                                            >
                                                <option className="bg-[#1e1e1e] text-red-500" value="UNPAID">Төлөгдөөгүй</option>
                                                <option className="bg-[#1e1e1e] text-green-500" value="PAID">Төлөгдсөн</option>
                                                <option className="bg-[#1e1e1e] text-yellow-500" value="REFUNDED">Буцаагдсан</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Status */}
                                <div className="flex items-start gap-4 w-full">
                                    <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center w-full">
                                            <select
                                                className="bg-transparent hover:bg-white/5 text-gray-300 rounded px-1 -ml-1 py-0.5 text-sm focus:outline-none cursor-pointer transition-colors w-[fit-content]"
                                                value={selectedBooking.status}
                                                disabled={isSaving}
                                                onChange={(e) => updateBookingStatus(e.target.value)}
                                            >
                                                <option className="bg-[#1e1e1e]" value="PENDING">Шалгагдаж буй</option>
                                                <option className="bg-[#1e1e1e]" value="CONFIRMED">Баталгаажсан</option>
                                                <option className="bg-[#1e1e1e]" value="COMPLETED">Дууссан</option>
                                                <option className="bg-[#1e1e1e]" value="CANCELLED">Цуцлагдсан</option>
                                            </select>
                                            {isSaving && <span className="text-[10px] text-primary animate-pulse ml-2 uppercase font-bold">Түр хүлээнэ үү</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Dates Meta */}
                                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                    <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                                    <div className="text-sm text-gray-400">
                                        Захиалга #{selectedBooking.id} • {new Date(selectedBooking.createdAt).toLocaleDateString('mn-MN')}
                                    </div>
                                </div>

                                {/* Internal Notes */}
                                <div className="flex flex-col gap-2 pt-2">
                                    <div className="text-sm font-medium text-gray-400 flex items-center justify-between">
                                        <span>Дотоод тэмдэглэл (Админ)</span>
                                        <button
                                            onClick={updateBookingNotes}
                                            disabled={isSaving || !newNoteText.trim()}
                                            className="text-xs bg-primary/20 text-primary hover:bg-primary/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? 'Хадгалж байна' : 'Нэмэх'}
                                        </button>
                                    </div>

                                    {/* Existing Notes Display */}
                                    {selectedBooking.notes && (
                                        <div className="w-full bg-black/40 border border-white/5 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                                            {selectedBooking.notes.trim()}
                                        </div>
                                    )}

                                    {/* New Note Input */}
                                    <textarea
                                        rows={2}
                                        className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-gray-600 mt-1"
                                        placeholder="Шинэ тэмдэглэлээ энд үлдээнэ үү..."
                                        value={newNoteText}
                                        onChange={(e) => setNewNoteText(e.target.value)}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= ADD MANUAL BOOKING MODAL ================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !isSaving && setIsAddModalOpen(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h2 className="text-lg font-semibold tracking-tight">
                                {modalMode === 'add' ? 'Захиалга нэмэх' : 'Захиалга засах'}
                            </h2>
                            <button onClick={() => !isSaving && setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <form id="add-booking-form" onSubmit={submitManualBooking} className="space-y-4">
                                {/* User Info */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Хэрэглэгч</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Нэр</label>
                                            <input required type="text" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Утас</label>
                                            <input required type="tel" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Цахим шуудан (сонголт)</label>
                                        <input type="email" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} />
                                    </div>
                                </div>

                                {/* Service Info */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Үйлчилгээ</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Төрөл</label>
                                            <select
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                value={addForm.serviceType}
                                                onChange={e => {
                                                    setAddForm(f => ({ ...f, serviceType: e.target.value, serviceId: '' }));
                                                    fetchServiceOptions(e.target.value);
                                                }}
                                            >
                                                <option value="STUDIO">Студио</option>
                                                <option value="PHOTOGRAPHER_SERVICE">Зураглаач</option>
                                                <option value="EDIT_SERVICE">Эдит</option>
                                                <option value="LIVE_SERVICE">Шууд дамжуулалт</option>
                                                <option value="BUNDLE_SERVICE">Багц</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Үйлчилгээ</label>
                                            <select
                                                required
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                                value={addForm.serviceId}
                                                disabled={serviceOptionsLoading || serviceOptions.length === 0}
                                                onChange={e => setAddForm(f => ({ ...f, serviceId: e.target.value }))}
                                            >
                                                {serviceOptionsLoading && <option value="">Уншиж байна...</option>}
                                                {!serviceOptionsLoading && serviceOptions.length === 0 && <option value="">Үйлчилгээ алга</option>}
                                                {serviceOptions.map(o => (
                                                    <option key={o.id} value={o.id}>{o.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Огноо</label>
                                            <input required type="date" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]" value={addForm.date} onChange={e => { setAddForm({ ...addForm, date: e.target.value }); setTimeConflict(null); }} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Эхлэх</label>
                                            <select
                                                required
                                                className="w-full bg-[#111] border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                value={addForm.startTime}
                                                onChange={e => { setAddForm(f => ({ ...f, startTime: e.target.value })); setTimeConflict(null); }}
                                            >
                                                <option value="">— : —</option>
                                                {TIME_SLOTS.filter(t => !adminBookedSlots.includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Дуусах</label>
                                            <select
                                                required
                                                className="w-full bg-[#111] border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                value={addForm.endTime}
                                                onChange={e => { setAddForm(f => ({ ...f, endTime: e.target.value })); setTimeConflict(null); }}
                                            >
                                                <option value="">— : —</option>
                                                {TIME_SLOTS.filter(t => !adminBookedSlots.includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {timeConflict && (
                                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 mt-1">
                                            ⚠️ {timeConflict}
                                        </div>
                                    )}
                                </div>

                                {/* Status & Price */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Төлбөр & Төлөв</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Нийт дүн (₮)</label>
                                            <input 
                                                required 
                                                type="text" 
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" 
                                                value={(addForm.totalAmount as any) !== "" && addForm.totalAmount !== undefined ? Number(addForm.totalAmount).toLocaleString('en-US') : ''} 
                                                onChange={e => {
                                                    const rawValue = e.target.value.replace(/,/g, '');
                                                    if (rawValue === '') {
                                                        setAddForm({ ...addForm, totalAmount: "" as any });
                                                    } else if (!isNaN(Number(rawValue))) {
                                                        setAddForm({ ...addForm, totalAmount: Number(rawValue) });
                                                    }
                                                }} 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Төлбөрийн төлөв</label>
                                            <select className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" value={addForm.paymentStatus} onChange={e => setAddForm({ ...addForm, paymentStatus: e.target.value })}>
                                                <option className="text-green-500" value="PAID">Төлөгдсөн</option>
                                                <option className="text-red-500" value="UNPAID">Төлөгдөөгүй</option>
                                                <option className="text-yellow-500" value="REFUNDED">Буцаагдсан</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Захиалгын төлөв</label>
                                        <select className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value })}>
                                            <option value="CONFIRMED">Баталгаажсан</option>
                                            <option value="PENDING">Шалгагдаж буй</option>
                                            <option value="COMPLETED">Дууссан</option>
                                            <option value="CANCELLED">Цуцлагдсан</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Тэмдэглэл</label>
                                        <textarea rows={2} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none" value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} placeholder="Нэмэлт тайлбар..." />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                                Болих
                            </button>
                            <button type="submit" form="add-booking-form" disabled={isSaving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSaving && <span className="animate-pulse">Түр хүлээнэ үү...</span>}
                                {!isSaving && "Хадгалах"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
