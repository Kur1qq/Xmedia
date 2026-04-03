"use client";

import { Bell, Search, CheckCircle2, AlertCircle, FileText, ShoppingBag } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface AdminNotification {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    referenceId: number | null;
    createdAt: string;
}

export function Header() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const prevUnreadCount = useRef<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const playNotificationSound = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContextClass();
            }
            const ctx = audioCtxRef.current;
            
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }

            const playTone = (freq: number, startAt: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'triangle'; // Илүү тод сонсогдоно
                
                const startTime = ctx.currentTime + startAt;
                osc.frequency.setValueAtTime(freq, startTime);
                
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(1.0, startTime + 0.05); // Хурдан чангарах
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Аажмаар сулрах
                
                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            // Илүү тод, өндөр өнгийн Ding-Dong дуу
            playTone(880, 0, 0.4);       // A5 - эхний дуу
            playTone(1108.73, 0.2, 0.8); // C#6 - хоёр дахь дуу 
        } catch {
            console.warn("AudioContext failed to play");
        }
    };

    // Эхний click хийх үед автоматаар context-ийг initialize хийж "resume" хийнэ (хамгаалалт давах)
    useEffect(() => {
        const unlockAudio = () => {
            if (audioCtxRef.current?.state === 'suspended') {
                audioCtxRef.current.resume();
            } else if (!audioCtxRef.current) {
                try {
                    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                } catch {}
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('keydown', unlockAudio, { once: true });
        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${apiUrl}/admin/notifications`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (!res.ok) return;
            const data: AdminNotification[] = await res.json();
            const newUnreadCount = data.filter(n => !n.isRead).length;

            if (prevUnreadCount.current !== null && newUnreadCount > prevUnreadCount.current) {
                playNotificationSound();
            }
            prevUnreadCount.current = newUnreadCount;
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const token = localStorage.getItem("admin_token");
            await fetch(`${apiUrl}/admin/notifications/${id}/read`, {
                method: 'PATCH',
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            prevUnreadCount.current = (prevUnreadCount.current ?? 1) - 1;
        } catch { /* ignore */ }
    };

    const markAllAsRead = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const token = localStorage.getItem("admin_token");
            await fetch(`${apiUrl}/admin/notifications/read-all`, {
                method: 'PATCH',
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            prevUnreadCount.current = 0;
        } catch { /* ignore */ }
    };

    const getNotifMeta = (type: string) => {
        switch (type) {
            case 'NEW_ORDER': return { icon: <ShoppingBag size={14} />, color: 'bg-green-100 text-green-600' };
            case 'NEW_INVOICE_REQUEST': return { icon: <FileText size={14} />, color: 'bg-blue-100 text-blue-600' };
            case 'PAYMENT_CONFIRMED': return { icon: <CheckCircle2 size={14} />, color: 'bg-emerald-100 text-emerald-600' };
            case 'ORDER_CANCELLED': return { icon: <AlertCircle size={14} />, color: 'bg-red-100 text-red-600' };
            default: return { icon: <Bell size={14} />, color: 'bg-primary/10 text-primary' };
        }
    };

    return (
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 lg:pl-6 pl-16">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Хайх..."
                        className="w-full bg-muted/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground text-foreground"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 relative">
                <div ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(prev => !prev)}
                        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 top-12 mt-2 w-80 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    Мэдэгдэл
                                    {unreadCount > 0 && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                                        Бүгдийг уншсан болгох
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto divide-y divide-border">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                                        <Bell size={32} className="mb-2 opacity-20" />
                                        <p>Одоогоор шинэ мэдэгдэл алга байна.</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => {
                                        const { icon, color } = getNotifMeta(notif.type);
                                        return (
                                            <div
                                                key={notif.id}
                                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                                className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${notif.isRead ? 'opacity-60' : 'bg-muted/10'}`}
                                            >
                                                <div className={`shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                                                    {icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${notif.isRead ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(notif.createdAt).toLocaleString('mn-MN')}
                                                    </p>
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="shrink-0 flex items-center">
                                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent border-2 border-background shadow-sm overflow-hidden flex items-center justify-center text-primary-foreground font-medium text-xs">
                    A
                </div>
            </div>
        </header>
    );
}
