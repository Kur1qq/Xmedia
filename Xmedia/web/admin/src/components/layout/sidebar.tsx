"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings, LogOut, Menu, X, Camera, Tv, Video, Film, BookOpen, Sliders, ShieldCheck, ScrollText, User } from "lucide-react";
import { useState, useEffect } from "react";
import { getAdminInfo, logout } from "@/lib/auth";

const ROLE_LABELS: Record<string, string> = { SUPER_ADMIN: 'Дээд Админ', ADMIN: 'Админ', MODERATOR: 'Модератор' };

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [admin, setAdmin] = useState<{ username: string; image?: string; role: string } | null>(null);

    useEffect(() => { setAdmin(getAdminInfo()); }, []);

    const isSuperOrAdmin = admin?.role === 'SUPER_ADMIN' || admin?.role === 'ADMIN';

    const navigation = [
        { name: "Нүүр", href: "/", icon: Home },
        { name: "Хэрэглэгчид", href: "/users", icon: Users },
        { name: "Захиалга", href: "/bookings", icon: BookOpen },
        { name: "Студио", href: "/studio", icon: Camera },
        { name: "Шууд дамжуулалт", href: "/live", icon: Tv },
        { name: "Зураглаач", href: "/photographer", icon: Camera },
        { name: "Видеограф", href: "/videographer", icon: Video },
        { name: "Эдит", href: "/edit", icon: Film },
        ...(isSuperOrAdmin ? [
            { name: "Админ удирдлага", href: "/admins", icon: ShieldCheck },
            { name: "Системийн лог", href: "/logs", icon: ScrollText },
        ] : []),
        { name: "Тохиргоо", href: "/settings", icon: Sliders },
    ];

    return (
        <>
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background text-foreground shadow-sm border border-border"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
            )}

            <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-background border-r border-border transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Xtudio-Admin
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                <Icon size={20} className={isActive ? "text-primary-foreground" : ""} />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: Admin info + logout */}
                <div className="p-4 border-t border-border shrink-0">
                    {admin && (
                        <div className="flex items-center gap-3 mb-3 px-2">
                            {admin.image
                                ? <img src={admin.image} alt={admin.username} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><User size={16} className="text-muted-foreground" /></div>}
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{admin.username}</p>
                                <p className="text-xs text-muted-foreground">{ROLE_LABELS[admin.role] || admin.role}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-rose-950/30 hover:text-rose-500 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Гарах</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
