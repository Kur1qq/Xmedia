"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAdminInfo, getAdminPermissions, fetchWithAuth } from "@/lib/auth";

const EDITOR_ALLOWED_PATHS = ['/', '/edit', '/settings'];

function isPathAllowed(permissions: string[], pathname: string): boolean {
    return permissions.some(p =>
        p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')
    );
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const admin = getAdminInfo();

        if (admin?.role === 'EDITOR') {
            const isAllowed = EDITOR_ALLOWED_PATHS.some(path =>
                path === '/' ? pathname === '/' : pathname.startsWith(path)
            );
            if (!isAllowed) router.replace('/');
            else setAuthorized(true);

        } else if (admin?.role === 'CUSTOM') {
            const cached = getAdminPermissions();

            if (cached && cached.length > 0) {
                // Use cached permissions from localStorage
                if (!isPathAllowed(cached, pathname)) router.replace('/');
                else setAuthorized(true);
            } else {
                // Stale session: fetch permissions from API then re-check
                fetchWithAuth('/admin/roles')
                    .then(res => res.ok ? res.json() : [])
                    .then((roles: { id: number; permissions: string[] }[]) => {
                        if (!admin.customRoleId) { setAuthorized(true); return; }
                        const role = roles.find((r: { id: number }) => r.id === admin.customRoleId);
                        const perms: string[] = (role?.permissions as string[]) || ['/'];
                        // Cache for subsequent route changes
                        localStorage.setItem('admin_permissions', JSON.stringify(perms));
                        if (!isPathAllowed(perms, pathname)) router.replace('/');
                        else setAuthorized(true);
                    })
                    .catch(() => setAuthorized(true)); // fail-open on network error
            }
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    if (!authorized) return null;
    return <>{children}</>;
}
