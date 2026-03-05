const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Sets both localStorage and a cookie (middleware reads the cookie server-side)
function setCookieToken(token: string) {
    document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

function clearCookieToken() {
    document.cookie = 'admin_token=; path=/; max-age=0';
}

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
}

export function getAdminInfo(): { id: number; username: string; image?: string; role: string; customRoleId?: number | null } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('admin_info');
    return raw ? JSON.parse(raw) : null;
}

/** Returns the page paths the current CUSTOM-role admin is allowed to access. */
export function getAdminPermissions(): string[] | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('admin_permissions');
    return raw ? JSON.parse(raw) : null;
}

export function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    localStorage.removeItem('admin_permissions');
    clearCookieToken();
    window.location.href = '/auth/login';
}

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
    const token = getToken();
    const isFormData = options.body instanceof FormData;
    return fetch(`${API}${path}`, {
        ...options,
        headers: {
            // Don't set Content-Type for FormData — browser sets it with the correct multipart boundary
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * Call after a successful login to store token, admin info, and
 * (if CUSTOM role) the page-level permissions from the role.
 */
export async function saveLoginResult(token: string, admin: {
    id: number; username: string; image?: string; role: string;
    customRoleId?: number | null;
    customRole?: { permissions: string[] } | null;
}) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_info', JSON.stringify({
        id: admin.id,
        username: admin.username,
        image: admin.image,
        role: admin.role,
        customRoleId: admin.customRoleId ?? null,
    }));
    setCookieToken(token);

    // For CUSTOM role, persist the permissions list
    if (admin.role === 'CUSTOM' && admin.customRole?.permissions) {
        localStorage.setItem('admin_permissions', JSON.stringify(admin.customRole.permissions));
    } else {
        localStorage.removeItem('admin_permissions');
    }
}
