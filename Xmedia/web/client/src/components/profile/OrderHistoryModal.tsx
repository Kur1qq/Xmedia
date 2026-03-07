"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/auth";
import { Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BookingItem {
    service?: { name: string };
    studio?: { name: string };
    photographerService?: { name: string };
    liveService?: { name: string };
    editService?: { name: string };
    bookingDate?: string;
}

interface Order {
    id: string;
    createdAt: string;
    totalAmount: number;
    status: string;
    serviceName?: string;
    bookingDate?: string;
    items: BookingItem[];
}

interface RawBooking {
    id: number | string;
    createdAt: string;
    totalAmount: number;
    status: string;
    items?: BookingItem[];
}

export function OrderHistoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleCancelOrder = async (orderId: string) => {
        // orderId has "ORD-" prefix, need to strip it to get the raw numeric ID
        const rawId = parseInt(orderId.replace("ORD-", ""), 10);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const response = await fetch(`${apiUrl}/bookings/${rawId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" })
            });

            if (!response.ok) {
                throw new Error("Failed to cancel booking");
            }

            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: "cancelled" } : order
            ));
            toast.info("Захиалга амжилттай цуцлагдлаа.");
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error("Захиалга цуцлахад алдаа гарлаа.");
        }
    };

    useEffect(() => {
        if (!isOpen || !user) return;

        async function fetchOrders() {
            setIsLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
                const response = await fetch(`${apiUrl}/bookings/user/${user?.id}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch");
                }

                const data = await response.json();

                // Map backend booking model to frontend order interface
                const mappedOrders: Order[] = data.map((b: RawBooking) => {
                    // Try to extract a logical service name and booking date from the first item
                    const firstItem = b.items?.[0];
                    let serviceName = "Сонгосон үйлчилгээ";
                    if (firstItem) {
                        if (firstItem.service) serviceName = firstItem.service.name;
                        else if (firstItem.studio) serviceName = firstItem.studio.name;
                        else if (firstItem.photographerService) serviceName = firstItem.photographerService.name;
                        else if (firstItem.liveService) serviceName = firstItem.liveService.name;
                        else if (firstItem.editService) serviceName = firstItem.editService.name;
                    }

                    return {
                        id: `ORD-${b.id.toString().padStart(4, '0')}`,
                        createdAt: b.createdAt,
                        totalAmount: b.totalAmount,
                        status: b.status === "PENDING" ? "pending" : b.status === "CONFIRMED" ? "completed" : "cancelled",
                        serviceName,
                        bookingDate: firstItem?.bookingDate ? new Date(firstItem.bookingDate).toLocaleDateString("mn-MN") : undefined,
                        items: b.items || []
                    };
                });

                setOrders(mappedOrders);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                setIsLoading(false);
            }
        }

        fetchOrders();
    }, [isOpen, user]);

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] bg-black/95 text-white border-white/10 max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <PackageOpen className="w-5 h-5 text-primary" />
                        Миний захиалгын түүх
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                            <p>Уншиж байна...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <PackageOpen className="w-12 h-12 mb-4 opacity-20" />
                            <p>Танд одоогоор захиалга байхгүй байна.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-white">{order.id}</p>
                                            {order.bookingDate && (
                                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                                                    Огноо: {order.bookingDate}
                                                </span>
                                            )}
                                        </div>
                                        {order.serviceName && (
                                            <p className="text-sm font-medium text-primary">
                                                {order.serviceName}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Үүсгэсэн: {new Date(order.createdAt).toLocaleDateString("mn-MN")}
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-2 mt-2 sm:mt-0">
                                        <div className="flex flex-col sm:items-end gap-1">
                                            <p className="font-bold text-lg">{order.totalAmount.toLocaleString()} ₮</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`flex h-2 w-2 rounded-full ${order.status === 'completed' ? 'bg-green-500' : order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                                <span className="text-xs font-medium text-gray-300 capitalize">
                                                    {order.status === "completed" ? "Баталгаажсан" : order.status === "pending" ? "Хүлээгдэж буй" : "Цуцлагдсан"}
                                                </span>
                                            </div>
                                        </div>
                                        {order.status === "pending" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 px-3 text-xs bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 w-full sm:w-auto mt-1"
                                                onClick={() => handleCancelOrder(order.id)}
                                            >
                                                Захиалга цуцлах
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
