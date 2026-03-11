export interface CustomerInfo {
    name?: string;
    phone?: string;
    email?: string;
    orgInfo?: {
        orgName: string;
        orgReg: string;
        orgAddress: string;
        orgPhone: string;
    };
}

const STORAGE_KEY = 'xmedia_customer';
const EXPIRY_DAYS = 90;

export function saveCustomerInfo(info: Partial<CustomerInfo>) {
    if (typeof window === "undefined") return;
    try {
        const existing = loadCustomerInfo() || {};
        const merged = { ...existing, ...info };
        const data = {
            ...merged,
            expiresAt: new Date().getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save customer info", e);
    }
}

export function loadCustomerInfo(): Partial<CustomerInfo> | null {
    if (typeof window === "undefined") return null;
    try {
        const itemStr = localStorage.getItem(STORAGE_KEY);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        if (item.expiresAt && new Date().getTime() > item.expiresAt) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        
        return item;
    } catch (e) {
        return null;
    }
}
