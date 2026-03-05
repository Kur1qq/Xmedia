"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Film, X, ArrowLeft, Phone, User, Loader2, Check, Info, GalleryVerticalEnd, Mail, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cart";
import { saveCustomerInfo, loadCustomerInfo } from "@/lib/customer";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface ServicePackage {
    id: number;
    subTypeId: number;
    price: number;
    priceLabel?: string;
    subType?: {
        id: number;
        name: string;
        description?: string;
    };
}

interface EditService {
    id: number;
    name: string;
    description: string;
    image: string;
    isActive: boolean;
    packages: ServicePackage[];
    amenities?: string[];
}

export default function VideoEditingPage() {
    const [services, setServices] = useState<EditService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<EditService | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", email: "", date: undefined as Date | undefined, notes: "" });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { addItem } = useCartStore();

    useEffect(() => {
        const savedInfo = loadCustomerInfo();
        if (savedInfo) {
            setForm(prev => ({ ...prev, name: savedInfo.name, phone: savedInfo.phone, email: savedInfo.email }));
        }
        fetch(`${API}/edit-services`)
            .then(r => r.json())
            .then(data => setServices(Array.isArray(data) ? data : data.data ?? data.items ?? []))
            .catch(() => toast.error("Мэдээлэл татахад алдаа гарлаа."))
            .finally(() => setLoading(false));
    }, []);

    const minPrice = (s: EditService) => {
        if (!s.packages || s.packages.length === 0) return 0;
        return Math.min(...s.packages.map(p => p.price));
    };

    const validateForm = () => {
        if (!form.name || !form.phone || !form.email) { toast.error("Хэрэглэгчийн мэдээллээ бүрэн оруулна уу."); return false; }
        if (!form.date) { toast.error("Огноогоо сонгоно уу."); return false; }
        return true;
    };

    const handleAddToCart = () => {
        if (!validateForm()) return;

        addItem({
            serviceType: "EDIT_SERVICE",
            serviceId: selected!.id,
            serviceName: selected!.name,
            date: format(form.date!, "yyyy-MM-dd"),
            time: "09:00", // Defaulting to start of day since edit service doesn't mandate specific time slots
            duration: 1, // Quantity of service packages
            unitPrice: Number(selectedPackage ? selectedPackage.price : 0),
        });

        saveCustomerInfo({ name: form.name, phone: form.phone, email: form.email });
        toast.success("Сагсанд нэмэгдлээ!", { description: "Та сагс руугаа орж төлбөрөө төлнө үү.", duration: 4000 });
        close();
    };

    const handleBuyNow = async (paymentType: "qpay" | "invoice") => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${API}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name, phone: form.phone, email: form.email,
                    date: format(form.date!, "yyyy-MM-dd"), time: "09:00",
                    duration: 1,
                    serviceType: "EDIT_SERVICE", serviceId: selected!.id,
                    unitPrice: Number(selectedPackage ? selectedPackage.price : 0),
                    serviceName: selected!.name,
                    paymentType,
                }),
            });
            if (!res.ok) throw new Error();

            saveCustomerInfo({ name: form.name, phone: form.phone, email: form.email });

            const data = await res.json();
            if (paymentType === "qpay" && data.checkoutUrl) {
                toast.success("Төлбөрийн хуудас руу шилжиж байна...", { duration: 3000 });
                window.location.href = data.checkoutUrl;
                return;
            }
            toast.success("Захиалга амжилттай бүртгэгдлээ!", { description: "Удахгүй холбогдох болно.", duration: 6000 });
            close();
        } catch {
            toast.error("Захиалга бүртгэхэд алдаа гарлаа.");
        } finally { setSubmitting(false); setShowPaymentModal(false); }
    };

    const close = () => { setSelected(null); setIsBooking(false); setSelectedPackage(null); setForm({ name: "", phone: "", email: "", date: undefined, notes: "" }); };

    return (
        <div className="pt-40 md:pt-48 pb-24 min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="mb-18 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-4">Видео <span className="text-primary">Эвлүүлэг</span></h1>
                        <p className="text-gray-400 text-lg">Мэргэжлийн видео монтаж, дата редакт болон пост-продакшин үйлчилгээ.</p>
                    </div>
                    <Link href="/portfolio/edit">
                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2">
                            <GalleryVerticalEnd className="w-4 h-4 text-primary" />
                            Өмнөх ажлууд харах
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : services.length === 0 ? (
                    <p className="text-gray-500 text-center py-24">Одоогоор үйлчилгээ нэмэгдээгүй байна.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((svc, i) => (
                            <motion.div key={svc.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 * i }}
                                className="group bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-300 cursor-pointer"
                                onClick={() => setSelected(svc)}>
                                <div className="relative h-52 overflow-hidden">
                                    {svc.image
                                        ? <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${svc.image}')` }} />
                                        : <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center"><Film className="w-12 h-12 text-zinc-600" /></div>
                                    }
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
                                </div>
                                <div className="p-6 pt-3">
                                    <h3 className="text-xl font-bold mb-2">{svc.name}</h3>
                                    <p className="text-gray-400 text-sm mb-5 line-clamp-2">{svc.description}</p>
                                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-[10px] uppercase tracking-wider">Үнэ</span>
                                            <span className="text-white font-bold text-lg">{svc.packages?.length > 0 ? `${minPrice(svc).toLocaleString()}₮ -с` : 'Үнэ тодорхойгүй'}</span>
                                        </div>
                                        <Button size="sm" className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/10 font-semibold transition-all">Дэлгэрэнгүй</Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={close}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#111] w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row relative">
                            <button onClick={close} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"><X className="w-5 h-5" /></button>

                            <div className={`relative h-48 md:h-auto md:w-5/12 flex-shrink-0 ${isBooking ? 'hidden md:block' : ''}`}>
                                {selected.image
                                    ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${selected.image}')` }} />
                                    : <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center"><Film className="w-16 h-16 text-zinc-600" /></div>
                                }
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111]" />
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    {!isBooking ? (
                                        <motion.div key="detail" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="p-6 md:p-10 flex flex-col h-full">
                                            <div className="flex flex-wrap gap-4 items-center justify-between mb-3">
                                                <div className="flex w-fit items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase border border-red-500/20">
                                                    EDITING
                                                </div>
                                            </div>
                                            <h2 className="text-2xl font-bold mb-2">{selected.name}</h2>
                                            <p className="text-gray-400 mb-6 leading-relaxed">{selected.description}</p>

                                            {selected.amenities && selected.amenities.length > 0 && (
                                                <div className="mb-6 w-full">
                                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                        <Info className="w-4 h-4 text-primary" /> Онцлог талууд
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {selected.amenities.map((amenity, i) => (
                                                            <div key={i} className="flex items-center gap-2.5 text-xs text-gray-200 bg-white/5 px-3 py-2 rounded-lg border border-white/5 truncate">
                                                                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                                                <span className="truncate">{amenity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Packages selection */}
                                            {selected.packages && selected.packages.length > 0 && (
                                                <div className="mb-6 w-full">
                                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                        Контентийн төрөл сонгох
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {selected.packages.map((pkg) => {
                                                            const isSelected = selectedPackage?.id === pkg.id;
                                                            return (
                                                                <div
                                                                    key={pkg.id}
                                                                    onClick={() => setSelectedPackage(pkg)}
                                                                    className={`cursor-pointer p-4 rounded-xl border relative transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                                                >
                                                                    {isSelected && <div className="absolute top-4 right-4"><Check className="w-4 h-4 text-primary" /></div>}
                                                                    <p className="text-sm font-medium pr-6">{pkg.subType?.name || pkg.priceLabel || "Үндсэн багц"}</p>
                                                                    {pkg.priceLabel && pkg.subType && <p className="text-xs text-gray-400 mt-1">{pkg.priceLabel}</p>}
                                                                    <p className="text-primary font-bold mt-3 text-lg">{Number(pkg.price).toLocaleString()}₮</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase mb-1">Нийт үнэ</p>
                                                    <p className="text-2xl font-bold">
                                                        {selectedPackage ? `${Number(selectedPackage.price).toLocaleString()}₮` : 'Сонгоно уу'}
                                                    </p>
                                                </div>
                                                <Button onClick={() => setIsBooking(true)} disabled={selected.packages?.length > 0 && !selectedPackage} className="px-8 h-11 bg-primary hover:bg-red-600 font-semibold">Захиалга өгөх</Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="booking" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="p-6 md:p-8">
                                            <div className="flex items-center gap-3 mb-5">
                                                <Button variant="ghost" size="icon" onClick={() => setIsBooking(false)} className="text-gray-400 hover:text-white hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></Button>
                                                <h2 className="text-xl font-bold">Захиалга — <span className="text-primary">{selected.name}</span></h2>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><Input required placeholder="Таны нэр" className="pl-10 bg-[#1a1a1a] border-white/10 text-white" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                                <div className="relative"><Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><Input required type="tel" placeholder="Утасны дугаар" className="pl-10 bg-[#1a1a1a] border-white/10 text-white" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                                <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><Input required type="email" placeholder="И-мэйл хаяг" className="pl-10 bg-[#1a1a1a] border-white/10 text-white" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-10", !form.date && "text-gray-500")}>
                                                            <CalendarIcon className="h-4 w-4 shrink-0 text-gray-500" />
                                                            <span>{form.date ? format(form.date, "yyyy-MM-dd") : "Эхлэх огноо сонгох"}</span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 bg-[#111] border-white/10 z-[200]" align="start">
                                                        <Calendar mode="single" selected={form.date} onSelect={d => setForm({ ...form, date: d })} className="bg-[#111] text-white" />
                                                    </PopoverContent>
                                                </Popover>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-2">Нэмэлт тайлбар (заавал биш)</p>
                                                    <textarea placeholder="Жишээ: 3 минутын хэрчмэл, музыктай, лого нэмэх..." className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-600" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                                </div>
                                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                                    <span className="text-gray-400 text-sm">Нийт:</span>
                                                    <span className="text-xl font-bold text-primary">{selectedPackage ? selectedPackage.price.toLocaleString() : 0}₮</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                    <Button type="button" onClick={handleAddToCart} disabled={submitting} variant="outline" className="flex-1 h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 font-semibold gap-2">
                                                        Сагсанд нэмэх
                                                    </Button>
                                                    <Button type="button"
                                                        onClick={() => { if (validateForm()) setShowPaymentModal(true); }}
                                                        disabled={submitting}
                                                        className="flex-1 h-11 bg-primary hover:bg-red-600 font-semibold text-white">
                                                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Уншиж байна...</> : "Шууд авах"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PaymentMethodModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSelectQpay={() => handleBuyNow("qpay")}
                onSelectInvoice={() => handleBuyNow("invoice")}
                loading={submitting}
                amount={selectedPackage ? Number(selectedPackage.price) : undefined}
            />
        </div>
    );
}
