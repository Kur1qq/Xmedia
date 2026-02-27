const API = 'http://localhost:4000/api';

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

export function getAdminInfo(): { id: number; username: string; image?: string; role: string } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('admin_info');
    return raw ? JSON.parse(raw) : null;
}

export function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    clearCookieToken();
    window.location.href = '/auth/login';
}

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
    const token = getToken();
    return fetch(`${API}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
}

export function isAuthenticated(): boolean {
    return !!getToken();
}
