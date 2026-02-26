"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, Clock, XCircle, ChevronDown, Package } from "lucide-react";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // View/Edit Modal State
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchBookings = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/bookings');
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateBookingStatus = async (status: string) => {
        if (!selectedBooking) return;
        setIsSaving(true);
        try {
            const res = await fetch(`http://localhost:3001/api/bookings/${selectedBooking.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                // Successful update, refresh local list
                await fetchBookings();
                // Update local selected booking state to immediately reflect in modal
                setSelectedBooking({ ...selectedBooking, status });
            } else {
                alert("Алдаа гарлаа. Дахин оролдоно уу.");
            }
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Захиалгууд</h1>
                    <p className="text-muted-foreground mt-1">Системд бүртгэгдсэн бүх захиалгын жагсаалт ба удирдлага.</p>
                </div>
            </div>

            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium border-b">ID</th>
                                <th className="px-6 py-4 font-medium border-b">Захиалагч</th>
                                <th className="px-6 py-4 font-medium border-b">Нийт дүн</th>
                                <th className="px-6 py-4 font-medium border-b">Огноо</th>
                                <th className="px-6 py-4 font-medium border-b">Төлбөр</th>
                                <th className="px-6 py-4 font-medium border-b">Төлөв</th>
                                <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        Мэдээлэл уншиж байна...
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        Одоогоор захиалга алга байна.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">#{booking.id}</td>
                                        <td className="px-6 py-4">
                                            <div>{booking.user?.username || 'Тодорхойгүй'}</div>
                                            <div className="text-xs text-muted-foreground">{booking.user?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {Number(booking.totalAmount).toLocaleString()} ₮
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(booking.createdAt).toLocaleString('mn-MN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${booking.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500' :
                                                booking.paymentStatus === 'REFUNDED' ? 'bg-gray-500/10 text-gray-400' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {booking.paymentStatus === 'PAID' ? 'Төлөгдсөн' :
                                                    booking.paymentStatus === 'REFUNDED' ? 'Буцаагдсан' :
                                                        'Хүлээгдэж буй'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${booking.status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-500' :
                                                booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                    booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                                                        'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {booking.status === 'CONFIRMED' ? 'Баталгаажсан' :
                                                    booking.status === 'COMPLETED' ? 'Дууссан' :
                                                        booking.status === 'CANCELLED' ? 'Цуцлагдсан' :
                                                            'Шалгагдаж буй'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Дэлгэрэнгүй
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-2xl rounded-lg border border-border/50 shadow-lg flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-border/50 p-6">
                            <div>
                                <h2 className="text-xl font-semibold">Захиалгын дэлгэрэнгүй (ID: #{selectedBooking.id})</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Огноо: {new Date(selectedBooking.createdAt).toLocaleString('mn-MN')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="rounded-full p-2 hover:bg-muted/50 transition-colors"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* User Info */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Захиалагчийн мэдээлэл</h3>
                                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-md border border-border/50 relative">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Нэр</p>
                                        <p className="font-medium">{selectedBooking.user?.username || 'Тодорхойгүй'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Утас</p>
                                        <p className="font-medium">{selectedBooking.user?.phone || 'Байхгүй'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-muted-foreground mb-1">Имэйл</p>
                                        <p className="font-medium">{selectedBooking.user?.email || 'Байхгүй'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Items */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Захиалсан зүйлс ({selectedBooking.items?.length || 0})</h3>
                                <div className="border border-border/50 rounded-md overflow-hidden bg-muted/10 divide-y divide-border/50">
                                    {selectedBooking.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 p-2 rounded-md h-fit">
                                                    <Package className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {item.itemType === 'STUDIO' ? `Студи: ${item.studio?.name || 'Устгагдсан'}` : `Үйлчилгээ: ${item.service?.name || 'Устгагдсан'}`}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{new Date(item.bookingDate).toLocaleDateString('mn-MN')}</span>
                                                        {item.startTime && item.endTime && (
                                                            <span>| {new Date(item.startTime).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{Number(item.totalPrice).toLocaleString()} ₮</p>
                                                <p className="text-xs text-muted-foreground">{item.quantity} x {Number(item.unitPrice).toLocaleString()} ₮</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedBooking.items || selectedBooking.items.length === 0) && (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            Хоосон байна
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-md border border-border/50">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Төлбөрийн төлөв</p>
                                    <p className="font-semibold mt-1">
                                        {selectedBooking.paymentStatus === 'PAID' ? 'Төлөгдсөн' :
                                            selectedBooking.paymentStatus === 'REFUNDED' ? 'Буцаагдсан' :
                                                'Төлөгдөөгүй'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-muted-foreground">Нийт төлбөр</p>
                                    <p className="text-xl font-bold text-primary">{Number(selectedBooking.totalAmount).toLocaleString()} ₮</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer actions */}
                        <div className="border-t border-border/50 p-6 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-lg">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-sm font-medium whitespace-nowrap">Төлөв өөрчлөх:</span>
                                <div className="relative group w-full sm:w-[180px]">
                                    <select
                                        className="w-full appearance-none bg-background border border-border/50 text-sm rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                        value={selectedBooking.status}
                                        disabled={isSaving}
                                        onChange={(e) => updateBookingStatus(e.target.value)}
                                    >
                                        <option value="PENDING">Шалгагдаж буй</option>
                                        <option value="CONFIRMED">Баталгаажсан</option>
                                        <option value="COMPLETED">Дууссан</option>
                                        <option value="CANCELLED">Цуцлагдсан</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                                {isSaving && <span className="text-xs text-muted-foreground animate-pulse">Уншиж байна...</span>}
                            </div>

                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="w-full sm:w-auto px-4 py-2 border border-border/50 hover:bg-muted/50 rounded-md text-sm font-medium transition-colors"
                            >
                                Хаах
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
