"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut, FileText, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
    { name: "Нүүр", href: "/", icon: LayoutDashboard },
    { name: "Хэрэглэгчид", href: "/users", icon: Users },
    { name: "Захиалга", href: "/bookings", icon: FileText },
    { name: "Төхөөрөмж", href: "/equipment", icon: FileText },
    { name: "Ангилал", href: "/category", icon: FileText },
    { name: "Студио", href: "/studio", icon: FileText },
    { name: "Шууд дамжуулалт", href: "/live", icon: FileText },
    { name: "Зурагчин", href: "/photographer", icon: FileText },
    { name: "Видеограф", href: "/videographer", icon: FileText },
    { name: "Үйлчилгээ", href: "/service", icon: FileText },
    { name: "Контент", href: "/content", icon: FileText },
    { name: "Тохиргоо", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background text-foreground shadow-sm border border-border"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-background border-r border-border transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-border">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            Xtudio-Admin
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-border">
                        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-rose-950/30 hover:text-rose-500 transition-colors">
                            <LogOut size={20} />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
