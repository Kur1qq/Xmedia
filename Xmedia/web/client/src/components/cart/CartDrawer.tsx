"use client";

import { useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/cart";
import { loadCustomerInfo, saveCustomerInfo } from "@/lib/customer";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function CartDrawer() {
    const { items, removeItem, clearCart, getTotalPrice } = useCartStore();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Customer Info Form
    const [customer, setCustomer] = useState(() => {
        const saved = loadCustomerInfo();
        return {
            name: saved?.name || "",
            phone: saved?.phone || "",
            email: saved?.email || "",
            notes: "",
        };
    });

    const handleCheckout = async (paymentType: "qpay" | "invoice") => {
        if (items.length === 0) return toast.error("Сагс хоосон байна");
        if (!customer.name || !customer.phone) return toast.error("Нэр, утасны дугаараа оруулна уу!");

        setLoading(true);
        saveCustomerInfo({ name: customer.name, phone: customer.phone, email: customer.email });

        try {
            const res = await fetch(`${API}/bookings/cart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...customer,
                    paymentType,
                    items: items.map(i => ({
                        date: i.date,
                        time: i.time,
                        duration: i.duration,
                        serviceType: i.serviceType,
                        serviceId: i.serviceId,
                        unitPrice: i.unitPrice,
                        serviceName: i.serviceName
                    }))
                }),
            });

            if (!res.ok) throw new Error("Алдаа гарлаа");

            const data = await res.json();
            if (paymentType === "qpay" && data.checkoutUrl) {
                clearCart();
                toast.success("Төлбөрийн хуудас руу шилжиж байна...", { duration: 3000 });
                setTimeout(() => window.location.href = data.checkoutUrl, 1500);
            } else {
                clearCart();
                toast.success("Захиалга амжилттай бүртгэгдлээ!", { description: "Нэхэмжлэлийг цахим дыгаараа авна уу.", duration: 5000 });
                setOpen(false);
            }
        } catch {
            toast.error("Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
        } finally {
            setLoading(false);
            setShowPaymentModal(false);
        }
    };

    return (<>
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-primary transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    {items.length > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                            {items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-md bg-[#0a0a0a] border-white/10 text-white flex flex-col h-full overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" /> Сагс
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            Сагс хоосон байна
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{item.serviceName}</p>
                                        <div className="text-xs text-gray-400 mt-1">
                                            <p>{format(new Date(item.date), "yyyy-MM-dd")} • {item.time}</p>
                                            <p>{item.duration} цаг • ₮{item.unitPrice.toLocaleString()}/цаг</p>
                                        </div>
                                        <p className="text-sm font-bold text-red-500 mt-1">
                                            ₮{(item.unitPrice * item.duration).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10" onClick={() => removeItem(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {items.length > 0 && (
                        <div className="space-y-4 border-t border-white/10 pt-4 mt-6">
                            <h3 className="font-semibold text-sm">Хувийн мэдээлэл</h3>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Нэр *</Label>
                                <Input
                                    value={customer.name}
                                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white"
                                    placeholder="Таны нэр"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Утас *</Label>
                                <Input
                                    type="tel"
                                    value={customer.phone}
                                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white"
                                    placeholder="Утасны дугаар"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">И-мэйл</Label>
                                <Input
                                    type="email"
                                    value={customer.email}
                                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white"
                                    placeholder="И-мэйл хаяг (Заавал биш)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400">Нэмэлт тайлбар</Label>
                                <Textarea
                                    value={customer.notes}
                                    onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white resize-none"
                                    placeholder="Хүсэлт, тайлбар (Заавал биш)"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <SheetFooter className="border-t border-white/10 pt-4 mt-auto">
                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Нийт дүн:</span>
                            <span className="text-red-500">₮{getTotalPrice().toLocaleString()}</span>
                        </div>
                        <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
                            disabled={items.length === 0 || loading}
                            onClick={() => {
                                if (items.length === 0) return toast.error("Сагс хоосон байна");
                                if (!customer.name || !customer.phone) return toast.error("Нэр, утасны дугаараа оруулна уу!");
                                setShowPaymentModal(true);
                            }}
                        >
                            {loading ? "Түр хүлээнэ үү..." : "Төлбөр төлөх"}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>

        <PaymentMethodModal
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onSelectQpay={() => handleCheckout("qpay")}
            onSelectInvoice={() => handleCheckout("invoice")}
            loading={loading}
            amount={getTotalPrice()}
        />
    </>);
}
