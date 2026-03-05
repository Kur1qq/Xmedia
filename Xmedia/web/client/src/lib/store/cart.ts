import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // unique internal ID for the cart item
    serviceType: 'STUDIO' | 'LIVE_SERVICE' | 'PHOTOGRAPHER_SERVICE' | 'EDIT_SERVICE';
    serviceId: number;
    serviceName: string;
    date: string;     // 'YYYY-MM-DD'
    time: string;     // 'HH:MM'
    duration: number; // hours
    unitPrice: number;
}

interface CartState {
    items: CartItem[];
    expiresAt: number | null;
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            expiresAt: null,
            addItem: (item) => set((state) => ({
                items: [...state.items, { ...item, id: Math.random().toString(36).substring(2, 9) }],
                expiresAt: Date.now() + THIRTY_DAYS_MS
            })),
            removeItem: (id) => set((state) => ({
                items: state.items.filter(item => item.id !== id),
                expiresAt: Date.now() + THIRTY_DAYS_MS
            })),
            clearCart: () => set({ items: [], expiresAt: null }),
            getTotalPrice: () => get().items.reduce((total, item) => total + (item.unitPrice * item.duration), 0),
        }),
        {
            name: 'xmedia-cart-storage',
            onRehydrateStorage: () => (state) => {
                if (state && state.expiresAt && Date.now() > state.expiresAt) {
                    // Items have expired, clear them entirely
                    state.clearCart();
                }
            }
        }
    )
);
