"use client";

import { Bell, Search, CheckCircle2 } from "lucide-react";
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

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            // Get token from localStorage if you use one for admin API (assuming cookie or localstorage approach is setup)
            const token = localStorage.getItem("admin_token");

            const res = await fetch(`${apiUrl}/admin/notifications`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Click outside to close
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        } catch (error) {
            console.error("Error marking read", error);
        }
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
        } catch (error) {
            console.error("Error marking all read", error);
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
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 top-12 mt-2 w-80 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                                <h3 className="font-semibold text-sm">Мэдэгдэл</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Бүгдийг уншсан болгох
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                                        <Bell size={32} className="mb-2 opacity-20" />
                                        <p>Одоогоор шинэ мэдэгдэл алга байна.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 flex gap-3 transition-colors ${notif.isRead ? 'bg-background opacity-70' : 'bg-muted/10'} hover:bg-muted/50 cursor-pointer`}
                                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                            >
                                                <div className="shrink-0 mt-0.5">
                                                    {notif.type === 'ORDER_CANCELLED' ? (
                                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                                            <Bell size={14} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                            <Bell size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${notif.isRead ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(notif.createdAt).toLocaleString('mn-MN')}
                                                    </p>
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="shrink-0 flex items-center">
                                                        <span className="w-2 h-2 rounded-full bg-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
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
