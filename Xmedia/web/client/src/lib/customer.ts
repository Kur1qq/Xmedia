// Save customer info to localStorage (expires in 30 days)
export function saveCustomerInfo(data: { name: string; phone: string; email: string }) {
    if (typeof window === "undefined") return;
    const expiresAt = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
    localStorage.setItem("xmedia_customer", JSON.stringify({ ...data, expiresAt }));
}

// Load customer info if not expired
export function loadCustomerInfo(): { name: string; phone: string; email: string } | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem("xmedia_customer");
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data.expiresAt && new Date().getTime() > data.expiresAt) {
            localStorage.removeItem("xmedia_customer");
            return null;
        }
        return { name: data.name || "", phone: data.phone || "", email: data.email || "" };
    } catch {
        return null;
    }
}
