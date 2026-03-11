"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, X, Check, Info, ArrowLeft, Calendar as CalendarIcon, Phone, User, Loader2, GalleryVerticalEnd, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cart";
import { saveCustomerInfo, loadCustomerInfo } from "@/lib/customer";
import { fetchBookedSlots, isTimeDisabled, ALL_TIMES } from "@/lib/booking-slots";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface CameraTier {
    id: number;
    cameraCount: number;
    label: string;
    price: number | string;
}

interface LiveEquipment {
    equipment: { name: string };
}

interface LiveService {
    id: number;
    name: string;
    description: string;
    image: string;
    amenities?: string[];
    priceTiers?: CameraTier[];
    equipments?: LiveEquipment[];
}

export default function LivestreamPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [services, setServices] = useState<LiveService[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ date: undefined as Date | undefined, time: "", duration: "1", tierId: "", name: "", phone: "", email: "" });
    const [tierRange, setTierRange] = useState<"1-4" | "4-8">("1-4");
    const [bookedTimes, setBookedTimes] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { addItem } = useCartStore();

    useEffect(() => {
        fetch(`${API}/live-services`)
            .then(r => r.json())
            .then(data => {
                const fetchedServices = Array.isArray(data) ? data : data.data ?? data.items ?? [];
                setServices(fetchedServices);
                if (fetchedServices.length > 0) {
                    setActiveServiceId(fetchedServices[0].id);
                }
            })
            .catch(() => toast.error("Мэдээлэл татахад алдаа гарлаа."))
            .finally(() => setLoading(false));
    }, []);

    const activeService = services.find(s => s.id === activeServiceId);

    useEffect(() => {
        if (user) {
            setForm(prev => ({ ...prev, name: user.name || "", phone: user.phone || "", email: user.email || "" }));
        } else {
            const info = loadCustomerInfo();
            if (info) {
                setForm(prev => ({ ...prev, name: info.name || prev.name, phone: info.phone || prev.phone, email: info.email || prev.email }));
            }
        }
    }, [user]);

    // Fetch booked slots when date or selected service changes
    useEffect(() => {
        if (!form.date || !isBooking || !activeService) { setBookedTimes([]); return; }
        setLoadingSlots(true);
        setForm(prev => ({ ...prev, time: "" }));
        fetchBookedSlots("LIVE_SERVICE", activeService.id, format(form.date, "yyyy-MM-dd"))
            .then(setBookedTimes)
            .finally(() => setLoadingSlots(false));
    }, [form.date, isBooking, activeService?.id]);

    const validateForm = (isBuyNow: boolean = false) => {
        if (isBuyNow) {
            if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) { toast.error("Мэдээллээ бүрэн оруулна уу (Нэр, Утас, Имэйл)."); return false; }
        }
        if (activeService?.priceTiers && activeService.priceTiers.length > 0 && !form.tierId) { toast.error("Камерийн тоог сонгоно уу."); return false; }
        if (!form.time) { toast.error("Цагаа сонгоно уу."); return false; }
        if (!form.date) { toast.error("Огноогоо сонгоно уу."); return false; }
        return true;
    }

    const handleAddToCart = () => {
        if (!validateForm() || !activeService) return;

        const unitPrice = activeService.priceTiers?.find(t => t.id.toString() === form.tierId)?.price || 0;

        addItem({
            serviceType: "LIVE_SERVICE",
            serviceId: activeService.id,
            serviceName: activeService.name,
            date: format(form.date!, "yyyy-MM-dd"),
            time: form.time,
            duration: parseInt(form.duration),
            unitPrice: Number(unitPrice),
        });

        toast.success("Сагсанд нэмэгдлээ!", { description: "Та сагс руугаа орж төлбөрөө төлнө үү." });
        closeBooking();
    };

    const handleBuyNow = async (paymentType: "qpay" | "invoice", orgInfo?: { orgName: string; orgReg: string; orgAddress: string; orgPhone: string }) => {
        if (!validateForm(true) || !activeService) return;

        if (!user) {
            saveCustomerInfo({ name: form.name, phone: form.phone, email: form.email });
        }

        setSubmitting(true);
        try {
            const unitPrice = activeService.priceTiers?.find(t => t.id.toString() === form.tierId)?.price || 0;

            const payload: Record<string, unknown> = {
                name: form.name,
                phone: form.phone,
                email: form.email,
                date: format(form.date!, "yyyy-MM-dd"), time: form.time,
                duration: parseInt(form.duration),
                serviceType: "LIVE_SERVICE", serviceId: activeService.id,
                unitPrice: Number(unitPrice),
                serviceName: activeService.name,
                paymentType,
                ...(orgInfo ? { buyerOrg: orgInfo.orgName, buyerOrgReg: orgInfo.orgReg, buyerOrgAddress: orgInfo.orgAddress, buyerOrgPhone: orgInfo.orgPhone } : {}),
            };
            if (user && user.id) payload.userId = parseInt(user.id, 10);

            const res = await fetch(`${API}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error();

            const data = await res.json();
            setShowPaymentModal(false);
            if (paymentType === "qpay" && data.checkoutUrl) {
                toast.success("Төлбөрийн хуудас руу шилжиж байна...");
                window.location.href = data.checkoutUrl;
                return;
            }
            const desc = paymentType === "invoice"
                ? "Нэхэмжлэхийг таны имэйл рүү явууллаа. Хэрэв имэйл оруулаагүй бол бидэнтэй холбогдоно уу."
                : "Удахгүй холбогдох болно.";
            toast.success("Захиалга амжилттай бүртгэгдлээ!", { description: desc });
            closeBooking();
        } catch {
            toast.error("Захиалга бүртгэхэд алдаа гарлаа.");
        } finally { setSubmitting(false); setShowPaymentModal(false); }
    };

    const closeBooking = () => { setIsBooking(false); setForm(prev => ({ ...prev, date: undefined, time: "", duration: "1", tierId: "", name: "", phone: "", email: "" })); };

    const handleTabChange = (id: number) => {
        setActiveServiceId(id);
        setIsBooking(false);
        setForm(prev => ({ ...prev, date: undefined, time: "", duration: "1", tierId: "", name: "", phone: "", email: "" }));
    }

    const getStartingPrice = (svc: LiveService) => {
        if (!svc.priceTiers || svc.priceTiers.length === 0) return 0;
        return Math.min(...svc.priceTiers.map(t => Number(t.price)));
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-rose-600/20 hover:bg-rose-600/30 blur-[120px] rounded-full pointer-events-none opacity-50 transition-opacity duration-700" />
            <div className="pt-28 md:pt-36 pb-24 relative z-10">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

                    {loading ? (
                        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-rose-600" /></div>
                    ) : services.length === 0 ? (
                        <p className="text-gray-500 text-center py-24">Одоогоор үйлчилгээ нэмэгдээгүй байна.</p>
                    ) : activeService && (
                        <div className="space-y-12">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16">

                                <div className={`relative h-[300px] lg:h-[600px] lg:w-1/2 flex-shrink-0 rounded-[24px] overflow-hidden ${isBooking ? 'hidden lg:block' : ''}`}>
                                    {activeService.image
                                        ? <motion.div key={activeService.image} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url('${activeService.image}')` }} />
                                        : <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center"><Radio className="w-16 h-16 text-zinc-600" /></div>
                                    }
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    <AnimatePresence mode="wait">
                                        {!isBooking ? (
                                            <motion.div key={`detail-${activeService.id}`} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex flex-col h-full py-4">

                                                {services.length > 1 && (
                                                    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 border border-white/10 rounded-[16px]">
                                                        {services.map(svc => (
                                                            <button
                                                                key={svc.id}
                                                                onClick={() => handleTabChange(svc.id)}
                                                                className={`flex-1 py-2.5 px-4 rounded-[12px] text-sm font-semibold transition-all ${activeServiceId === svc.id ? 'bg-[#1a1a1a] text-white shadow-md border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                            >
                                                                {svc.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-4 items-center justify-between mb-3">
                                                    <div className="flex w-fit items-center gap-2 px-2.5 py-1 bg-rose-600/10 text-rose-600 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase">
                                                        Live Stream
                                                    </div>
                                                    <Link href="/portfolio/live">
                                                        <Button variant="outline" className="text-rose-600 hover:text-white hover:bg-rose-600/20 border-rose-600/50 bg-rose-600/10 px-3 py-1.5 h-auto gap-2 text-xs md:text-sm animate-pulse shadow-[0_0_15px_hsla(var(--primary),0.5)] transition-all duration-300">
                                                            <GalleryVerticalEnd className="w-3.5 h-3.5 text-rose-600" />
                                                            Өмнөх ажлууд харах
                                                        </Button>
                                                    </Link>
                                                </div>

                                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{activeService.name}</h2>
                                                <p className="text-gray-400 mb-6 leading-relaxed text-sm md:text-base">{activeService.description}</p>

                                                {(activeService.amenities && activeService.amenities.length > 0) && (
                                                    <div className="mb-6 w-full">
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                            <Info className="w-4 h-4 text-rose-600" />Онцлог талууд
                                                        </h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {activeService.amenities.map((amenity, i) => (
                                                                <div key={i} className="flex items-center gap-2.5 text-xs text-gray-200 bg-[#141414] px-3 py-2 rounded-lg border border-white/5 truncate">
                                                                    <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                                                    <span className="truncate">{amenity}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {activeService.equipments && activeService.equipments.length > 0 && (
                                                    <div className="mb-6 w-full">
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                            <Info className="w-4 h-4 text-rose-600" />Тоног төхөөрөмж
                                                        </h4>
                                                        <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {activeService.equipments.map((eq, i) => (
                                                                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0 mt-[5px]" />
                                                                        <span className="flex-1 leading-snug">{eq.equipment?.name}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                                                    <div className="flex flex-col items-start md:items-center">
                                                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Эхлэх үнэ</p>
                                                        <p className="text-xl md:text-2xl font-bold text-white">{getStartingPrice(activeService).toLocaleString()}₮</p>
                                                    </div>
                                                    <Button onClick={() => {
                                                        setIsBooking(true);
                                                    }} className="w-full md:w-auto px-8 h-12 bg-rose-600 hover:bg-rose-600/90 font-semibold rounded-lg transition-all text-white">Захиалга өгөх</Button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div key={`booking-${activeService.id}`} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="h-full flex flex-col py-4">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <Button variant="ghost" size="icon" onClick={() => setIsBooking(false)} className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
                                                        <h2 className="text-xl font-bold line-clamp-1">Захиалга — <span className="text-rose-600">{activeService.name}</span></h2>
                                                    </div>
                                                </div>
                                                <div className="space-y-4 flex-1">
                                                    <div className="space-y-3 rounded-lg bg-white/5 border border-white/10 p-4">
                                                        <p className="text-sm text-white font-medium">Захиалагчийн мэдээлэл</p>
                                                        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Таны нэр *" />
                                                        <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Утасны дугаар *" />
                                                        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Имэйл хаяг *" />
                                                    </div>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" className={cn("w-full justify-start gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-10", !form.date && "text-gray-500")}>
                                                                <CalendarIcon className="h-4 w-4 shrink-0 text-gray-500" />
                                                                <span>{form.date ? format(form.date, "yyyy-MM-dd") : "Огноо сонгох"}</span>
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 bg-[#111] border-white/10 z-[200]" align="start">
                                                            <Calendar mode="single" selected={form.date} onSelect={d => setForm({ ...form, date: d })} className="bg-[#111] text-white" />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {activeService.priceTiers && activeService.priceTiers.length > 0 && (
                                                        <div>
                                                            <p className="text-sm text-gray-400 mb-2">Шууд дамжуулалтын цаг сонгох</p>
                                                            {/* Range filter buttons */}
                                                            <div className="flex gap-2 mb-3">
                                                                {(["1-4", "4-8"] as const).map(range => (
                                                                    <button
                                                                        key={range}
                                                                        type="button"
                                                                        onClick={() => { setTierRange(range); setForm(f => ({ ...f, tierId: "" })); }}
                                                                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${tierRange === range
                                                                                ? "bg-rose-600/10 border-rose-600 text-rose-600"
                                                                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                                                            }`}
                                                                    >
                                                                        {range} цаг
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {activeService.priceTiers
                                                                    .filter(t => (t.label || "").includes(tierRange))
                                                                    .map(t => (
                                                                        <button key={t.id} type="button" onClick={() => setForm({ ...form, tierId: t.id.toString() })}
                                                                            className={`py-2 px-3 text-xs text-left rounded-lg border transition-all ${form.tierId === t.id.toString() ? "bg-rose-600/10 border-rose-600 text-rose-600" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>
                                                                            <div className="font-semibold">{t.label || `${t.cameraCount} камер`}</div>
                                                                            <div className="mt-0.5">{Number(t.price).toLocaleString()}₮/цаг</div>
                                                                        </button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm text-gray-400 mb-2">
                                                            Эхлэх цаг
                                                            {loadingSlots && <span className="ml-2 text-xs text-gray-500">Шалгаж байна...</span>}
                                                        </p>
                                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                            {ALL_TIMES.map(t => {
                                                                const disabled = isTimeDisabled(t, bookedTimes, parseInt(form.duration || "1"));
                                                                return (
                                                                    <button key={t} type="button"
                                                                        disabled={disabled}
                                                                        onClick={() => !disabled && setForm({ ...form, time: t })}
                                                                        title={disabled ? "Захиалагдсан" : undefined}
                                                                        className={`py-2 text-xs rounded-lg border transition-all ${disabled
                                                                            ? "bg-white/5 border-white/5 text-gray-600 cursor-not-allowed opacity-40 line-through"
                                                                            : form.time === t
                                                                                ? "bg-rose-600/10 border-rose-600 text-rose-600"
                                                                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                                                            }`}>{t}</button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-400 mb-2">Хугацаа (цаг)</p>
                                                        <Input required type="number" min="1" max="24" className="bg-[#1a1a1a] border-white/10 text-white" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                                                    </div>

                                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                                                        <span className="text-gray-400 text-sm">Нийт үнэ:</span>
                                                        <span className="text-xl font-bold text-white">
                                                            {form.tierId
                                                                ? ((activeService.priceTiers?.find(t => t.id.toString() === form.tierId)?.price as number ?? 0) * parseInt(form.duration || "0")).toLocaleString() + "₮"
                                                                : "Сонгох"
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                        <Button type="button" onClick={handleAddToCart} disabled={submitting} variant="outline" className="flex-1 h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 font-semibold gap-2">
                                                            Сагсанд нэмэх
                                                        </Button>
                                                        <Button type="button"
                                                            onClick={() => { if (validateForm(true)) setShowPaymentModal(true); }}
                                                            disabled={submitting}
                                                            className="flex-1 h-11 bg-rose-600 hover:bg-rose-600/90 font-semibold text-white">
                                                            {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Уншиж байна...</> : "Шууд авах"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            <PaymentMethodModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSelectQpay={() => handleBuyNow("qpay")}
                onSelectInvoice={(orgInfo) => handleBuyNow("invoice", orgInfo)}
                loading={submitting}
            />
        </div>
    );
}
