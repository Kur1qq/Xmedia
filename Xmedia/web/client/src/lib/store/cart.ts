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
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => set((state) => ({
                items: [...state.items, { ...item, id: Math.random().toString(36).substring(2, 9) }]
            })),
            removeItem: (id) => set((state) => ({
                items: state.items.filter(item => item.id !== id)
            })),
            clearCart: () => set({ items: [] }),
            getTotalPrice: () => get().items.reduce((total, item) => total + (item.unitPrice * item.duration), 0),
        }),
        {
            name: 'xmedia-cart-storage',
        }
    )
);
