"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/constants";
import { LayoutDashboard, Calendar, Users, Settings, Video, Camera } from "lucide-react";

const sidebarNavItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Bookings",
        href: "/dashboard/bookings",
        icon: Calendar,
    },
    {
        title: "Studios",
        href: "/dashboard/studios",
        icon: Camera,
    },
    {
        title: "Services",
        href: "/dashboard/services",
        icon: Video,
    },
    {
        title: "Users",
        href: "/dashboard/users",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-muted/40 md:block w-64 h-full min-h-screen">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <span className="">{siteConfig.name} Admin</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {sidebarNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-rose-600",
                                    pathname === item.href
                                        ? "bg-muted text-rose-600"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
