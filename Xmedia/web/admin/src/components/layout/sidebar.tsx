"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, LogOut, Menu, X, Camera, Tv, Film, BookOpen, Sliders, ShieldCheck, ScrollText, User, KeyRound, Image as ImageIcon, PanelTop } from "lucide-react";
import { useState, useEffect } from "react";
import { getAdminInfo, getAdminPermissions, logout, fetchWithAuth } from "@/lib/auth";

const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Дээд Админ', ADMIN: 'Админ', MODERATOR: 'Модератор', EDITOR: 'Эдитор', CUSTOM: 'Захиалгат эрх'
};

const ALL_NAV = [
    { name: "Нүүр", href: "/", icon: Home },
    { name: "Хэрэглэгчид", href: "/users", icon: Users },
    { name: "Захиалга", href: "/bookings", icon: BookOpen },
    { name: "Студио", href: "/studio", icon: Camera },
    { name: "Шууд дамжуулалт", href: "/live", icon: Tv },
    { name: "Зураглаач", href: "/photographer", icon: Camera },
    { name: "Эдит", href: "/edit", icon: Film },
    { name: "Өмнөх ажлууд", href: "/portfolio", icon: ImageIcon },
    { name: "Нүүрний слайд", href: "/hero", icon: PanelTop },
    { name: "Админ удирдлага", href: "/admins", icon: ShieldCheck },
    { name: "Эрх удирдлага", href: "/roles", icon: KeyRound },
    { name: "Системийн лог", href: "/logs", icon: ScrollText },
    { name: "Тохиргоо", href: "/settings", icon: Sliders },
];

const EDITOR_ALLOWED = ['/', '/hero', '/edit', '/settings'];
const SUPER_ADMIN_ONLY = ['/admins', '/roles', '/logs'];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [admin, setAdmin] = useState<{ username: string; image?: string; role: string; customRoleId?: number | null } | null>(null);
    const [customPermissions, setCustomPermissions] = useState<string[] | null>(null);

    useEffect(() => {
        const info = getAdminInfo();
        setAdmin(info);

        if (info?.role === 'CUSTOM') {
            const cached = getAdminPermissions();
            if (cached && cached.length > 0) {
                setCustomPermissions(cached);
            } else if (info.customRoleId) {
                // Stale session: fetch from API
                fetchWithAuth('/admin/roles')
                    .then(res => res.ok ? res.json() : [])
                    .then((roles: { id: number; permissions: string[] }[]) => {
                        const role = roles.find((r: { id: number }) => r.id === info.customRoleId);
                        const perms: string[] = (role?.permissions as string[]) || ['/'];
                        localStorage.setItem('admin_permissions', JSON.stringify(perms));
                        setCustomPermissions(perms);
                    })
                    .catch(() => setCustomPermissions(['/']));
            } else {
                setCustomPermissions(['/']);
            }
        }
    }, []);

    const navigation = ALL_NAV.filter(item => {
        if (!admin) return false;
        const { role } = admin;

        if (role === 'EDITOR') return EDITOR_ALLOWED.includes(item.href);
        if (role === 'SUPER_ADMIN') return true;
        if (role === 'ADMIN') return item.href !== '/roles';
        if (role === 'CUSTOM') {
            const perms = customPermissions || [];
            return perms.some(p =>
                p === item.href ||
                (p !== '/' && item.href.startsWith(p + '/'))
            );
        }
        // MODERATOR
        return !SUPER_ADMIN_ONLY.includes(item.href);
    });

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
                                key={item.href}
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
                            {(admin as any).image
                                ? <img src={(admin as any).image} alt={admin.username} className="w-8 h-8 rounded-full object-cover shrink-0" />
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
