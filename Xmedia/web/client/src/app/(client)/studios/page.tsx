"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, Check, Info, ArrowLeft, Calendar as CalendarIcon, Loader2, GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cart";
import { fetchBookedSlots, HALF_HOURLY_TIMES } from "@/lib/booking-slots";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";
import { loadCustomerInfo, saveCustomerInfo } from "@/lib/customer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface StudioPackage {
    id: number;
    hours: number;
    price: number;
}

interface Studio {
    id: number;
    name: string;
    description: string;
    images: string[] | string | null;
    sizeSqm?: number;
    capacity?: number;
    amenities?: string[];
    equipment: { equipment: { name: string } }[];
    packages: StudioPackage[];
    extraHourPrice?: string | number | null;
}

export default function StudiosPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [studios, setStudios] = useState<Studio[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [selectedPackages, setSelectedPackages] = useState<Record<number, StudioPackage>>({});
    const [extraHoursChecked, setExtraHoursChecked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ date: undefined as Date | undefined, time: "", endTime: "", name: "", phone: "", email: "" });

    const calcDuration = (start: string, end: string): number => {
        if (!start || !end) return 1;
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        const diff = (eh * 60 + em) - (sh * 60 + sm);
        const adjustedDiff = diff > 0 ? diff : diff + 24 * 60;
        return adjustedDiff > 0 ? Math.round(adjustedDiff / 60 * 10) / 10 : 1;
    };

    const [bookedTimes, setBookedTimes] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { addItem } = useCartStore();

    useEffect(() => {
        fetch(`${API}/studio`)
            .then(r => r.json())
            .then(data => {
                const fetchedStudios = Array.isArray(data) ? data : data.data ?? data.items ?? [];
                setStudios(fetchedStudios);
                if (fetchedStudios.length > 0) {
                    setActiveServiceId(fetchedStudios[0].id);
                    const initial: Record<number, StudioPackage> = {};
                    fetchedStudios.forEach((s: Studio) => {
                        if (s.packages && s.packages.length > 0) {
                            initial[s.id] = s.packages[0];
                        }
                    });
                    setSelectedPackages(initial);
                }
            })
            .catch(() => toast.error("Студиудын мэдээлэл татахад алдаа гарлаа."))
            .finally(() => setLoading(false));
    }, []);

    const activeStudio = studios.find(s => s.id === activeServiceId);
    const currentPackage = activeStudio ? selectedPackages[activeStudio.id] : null;
    const extraPrice = activeStudio?.extraHourPrice ? Number(activeStudio.extraHourPrice) : 0;
    const hasExtraHourOption = extraPrice > 0;
    
    const currentDuration = currentPackage ? currentPackage.hours + (extraHoursChecked ? 1 : 0) : 0;
    const currentTotalPrice = currentPackage ? Number(currentPackage.price) + (extraHoursChecked ? extraPrice : 0) : 0;

    useEffect(() => {
        if (user) {
            const info = loadCustomerInfo();
            setForm(prev => ({
                ...prev,
                name: user.name || info?.name || "",
                phone: user.phone || info?.phone || "",
                email: user.email || info?.email || "",
            }));
        } else {
            const info = loadCustomerInfo();
            if (info) {
                setForm(prev => ({ ...prev, name: info.name || prev.name, phone: info.phone || prev.phone, email: info.email || prev.email }));
            }
        }
    }, [user]);

    useEffect(() => {
        if (form.name || form.phone || form.email) {
            const timer = setTimeout(() => {
                saveCustomerInfo({ name: form.name, phone: form.phone, email: form.email });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [form.name, form.phone, form.email]);

    useEffect(() => {
        if (!form.date || !activeStudio || !isBooking) { setBookedTimes([]); return; }
        setLoadingSlots(true);
        setForm(prev => ({ ...prev, time: "" }));
        fetchBookedSlots("STUDIO", activeStudio.id, format(form.date, "yyyy-MM-dd"))
            .then(setBookedTimes)
            .finally(() => setLoadingSlots(false));
    }, [form.date, isBooking, activeStudio?.id]);

    const getImage = (s: Studio): string => {
        if (!s.images) return "";
        if (Array.isArray(s.images) && s.images.length > 0) return s.images[0];
        if (typeof s.images === "string") {
            try { const p = JSON.parse(s.images); return Array.isArray(p) ? p[0] ?? "" : ""; } catch { return s.images; }
        }
        return "";
    };

    const handlePackageSelect = (studioId: number, pkg: StudioPackage) => {
        setSelectedPackages(prev => ({ ...prev, [studioId]: pkg }));
        setExtraHoursChecked(false);
        if (isBooking) {
            setForm(prev => ({ ...prev, time: "" }));
        }
    };

    const handleTabChange = (id: number) => {
        setActiveServiceId(id);
        setIsBooking(false);
        setExtraHoursChecked(false);
        setForm(prev => ({ ...prev, date: undefined, time: "" }));
    };

    const validateForm = (isBuyNow: boolean = false) => {
        if (isBuyNow) {
            if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) { toast.error("Мэдээллээ бүрэн оруулна уу (Нэр, Утас, Имэйл)."); return false; }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.email.trim())) { toast.error("Имэйл хаягаа зөв оруулна уу."); return false; }
            const phoneRegex = /^[0-9]{8}$/;
            if (!phoneRegex.test(form.phone.trim())) { toast.error("Утасны дугаар 8 оронтой тоо байх ёстой."); return false; }
        }
        if (!form.time) { toast.error("Цагаа сонгоно уу."); return false; }
        if (!form.date) { toast.error("Огноогоо сонгоно уу."); return false; }
        if (!currentPackage) { toast.error("Багц сонгоно уу."); return false; }
        return true;
    };

    const handleAddToCart = () => {
        if (!validateForm() || !activeStudio || !currentPackage) return;
        addItem({
            serviceType: "STUDIO",
            serviceId: activeStudio.id,
            serviceName: activeStudio.name + (extraHoursChecked ? " (Нэмэлт 1 цаг)" : ""),
            date: format(form.date!, "yyyy-MM-dd"),
            time: form.time,
            duration: currentDuration,
            unitPrice: currentTotalPrice / currentDuration,
        });
        toast.success("Сагсанд нэмэгдлээ!", { description: "Та сагс руугаа орж төлбөрөө төлнө үү." });
        closeBooking();
    };

    const handleBuyNow = async (paymentType: "qpay" | "invoice") => {
        if (!validateForm(true) || !activeStudio || !currentPackage) return;
        if (!user) { saveCustomerInfo({ name: form.name, phone: form.phone, email: form.email }); }
        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                name: form.name, phone: form.phone, email: form.email,
                date: format(form.date!, "yyyy-MM-dd"), time: form.time,
                duration: currentDuration,
                serviceType: "STUDIO", serviceId: activeStudio.id,
                unitPrice: currentTotalPrice / currentDuration,
                serviceName: activeStudio.name + (extraHoursChecked ? " (Нэмэлт 1 цаг)" : ""), paymentType,
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

    const closeBooking = () => { setIsBooking(false); setExtraHoursChecked(false); setForm(prev => ({ ...prev, date: undefined, time: "" })); };

    // Helper: check if a start time slot is unavailable (booked or no room for 1hr)
    const isStartTimeDisabled = (t: string): boolean => {
        if (bookedTimes.includes(t)) return true;
        if (!currentPackage || !currentPackage.hours) return false;
        const [sh, sm] = t.split(":").map(Number);
        const startMins = sh * 60 + sm;
        for (let m = startMins; m < startMins + 60; m += 30) {
            const checkH = Math.floor(m / 60) % 24;
            const checkM = m % 60;
            const checkStr = `${String(checkH).padStart(2, "0")}:${checkM === 0 ? "00" : "30"}`;
            if (bookedTimes.includes(checkStr)) return true;
        }
        return false;
    };

    return (
        <div className="h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-rose-600/20 hover:bg-rose-600/30 blur-[120px] rounded-full pointer-events-none opacity-50 transition-opacity duration-700" />

            <div className="flex-1 overflow-y-auto pt-20 pb-6 relative z-10 scrollbar-hide">
                <div className="min-h-full flex items-center justify-center py-8">
                    <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                            </div>
                        ) : studios.length === 0 ? (
                            <p className="text-gray-500 text-center py-24">Одоогоор студи нэмэгдээгүй байна.</p>
                        ) : activeStudio && (
                            <div className="space-y-6 w-full">
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                    className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16">

                                    <div className={`relative h-[250px] lg:h-[450px] max-h-[50vh] lg:w-[45%] flex-shrink-0 rounded-[24px] flex items-center justify-center ${isBooking ? 'hidden lg:block' : ''}`}>
                                        {getImage(activeStudio)
                                            ? <motion.img key={getImage(activeStudio)} src={getImage(activeStudio)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-full max-h-full object-contain rounded-[24px]" />
                                            : <div className="w-full h-full rounded-[24px] bg-zinc-800 flex items-center justify-center"><Camera className="w-16 h-16 text-zinc-600" /></div>
                                        }
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        <AnimatePresence mode="wait">
                                            {!isBooking ? (
                                                <motion.div key={`detail-${activeStudio.id}`} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex flex-col h-full py-4 pt-0">

                                                    {studios.length > 1 && (
                                                        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 border border-white/10 rounded-[16px]">
                                                            {studios.map(svc => (
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

                                                    <div className="flex items-center justify-between mb-3">
                                                        <h2 className="text-2xl md:text-3xl font-bold text-white">{activeStudio.name}</h2>
                                                        <Link href="/portfolio/studio">
                                                            <div className="flex w-fit items-center gap-2 px-2.5 py-1 bg-rose-600/10 text-white rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase hover:bg-rose-600/20 transition-all cursor-pointer">
                                                                <GalleryVerticalEnd className="w-3 h-3" />
                                                                Өмнөх ажил
                                                            </div>
                                                        </Link>
                                                    </div>
                                                    <Link
                                                        href="https://www.google.com/maps/place/XTUDIO/@48.0082871,106.9214316,671m/data=!3m1!1e3!4m6!3m5!1s0x694d69c46d9c5945:0xc9e3c9408887d71f!8m2!3d48.0082871!4d106.9240065!16s%2Fg%2F11ww0jglbw!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDMwNC4xIKXMDSoASAFQAw%3D%3D"
                                                        target="_blank" rel="noopener noreferrer" className="w-fit mb-4 block"
                                                    >
                                                        <div className="flex items-center gap-2 text-gray-300 text-sm hover:text-rose-600 transition-colors">
                                                            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                                                            <span className="line-clamp-1">Байршил: Shadivlan, Ulaanbaatar</span>
                                                        </div>
                                                    </Link>
                                                    <p className="text-gray-400 mb-5 leading-relaxed text-sm md:text-base">{activeStudio.description}</p>

                                                    {(activeStudio.amenities && activeStudio.amenities.length > 0) && (
                                                        <div className="mb-5 w-full">
                                                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                                <Info className="w-3.5 h-3.5 text-rose-600" />Онцлог талууд
                                                            </h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {activeStudio.amenities.map((amenity, i) => (
                                                                    <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300 truncate py-1">
                                                                        <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                                                        <span className="truncate">{amenity}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activeStudio.equipment?.length > 0 && (
                                                        <div className="mb-5 w-full">
                                                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                                <Info className="w-3.5 h-3.5 text-rose-600" />Тоног төхөөрөмж
                                                            </h4>
                                                            <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {activeStudio.equipment.map((eq, i) => (
                                                                        <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0 mt-[5px]" />
                                                                            <span className="flex-1 leading-snug">{eq.equipment?.name}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activeStudio.packages && activeStudio.packages.length > 0 && (
                                                        <div className="mb-4 w-full mt-auto pt-4">
                                                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">Үнийн багцууд</h4>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                {activeStudio.packages.map((pkg) => {
                                                                    const isSelected = selectedPackages[activeStudio.id]?.id === pkg.id;
                                                                    return (
                                                                        <div
                                                                            key={pkg.id}
                                                                            onClick={() => handlePackageSelect(activeStudio.id, pkg)}
                                                                            className={`cursor-pointer p-3 rounded-xl border relative transition-all flex flex-col items-center justify-center ${isSelected ? 'border-rose-600 bg-rose-600/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                                                        >
                                                                            {isSelected && <div className="absolute top-2 right-2"><Check className="w-3 h-3 text-rose-600" /></div>}
                                                                            <p className="text-lg font-bold text-white mb-1">{pkg.hours} цаг</p>
                                                                            <p className="text-gray-400 font-bold mt-1 text-xs">{Number(pkg.price).toLocaleString()}₮</p>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                                                        <div className="flex flex-col items-start md:items-center">
                                                            <p className="text-gray-500 text-[10px] uppercase tracking-wider">Нийт</p>
                                                            <p className="text-2xl font-bold">
                                                                {selectedPackages[activeStudio.id] ? `${Number(selectedPackages[activeStudio.id].price).toLocaleString()}₮` : 'Багц сонгоно уу'}
                                                            </p>
                                                        </div>
                                                        <Button onClick={() => { setIsBooking(true); }} disabled={activeStudio.packages?.length > 0 && !selectedPackages[activeStudio.id]} className="w-full md:w-auto px-8 h-12 bg-rose-600 hover:bg-rose-600/90 font-semibold rounded-lg transition-all text-white">Захиалга өгөх</Button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div key={`booking-${activeStudio.id}`} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="flex flex-col h-full py-4 pt-0">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <Button variant="ghost" size="icon" onClick={() => closeBooking()} className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
                                                        <h2 className="text-xl font-bold text-white line-clamp-1">Захиалга өгөх — <span className="text-rose-600">{activeStudio.name}</span></h2>
                                                    </div>
                                                    <div className="space-y-3 flex-1">
                                                        <div className="space-y-3 rounded-lg bg-white/5 border border-white/10 p-4">
                                                            <p className="text-sm text-white font-medium">Захиалагчийн мэдээлэл</p>
                                                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Таны нэр *" />
                                                            <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Утасны дугаар *" />
                                                            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Имэйл хаяг *" />
                                                        </div>
                                                        {activeStudio.packages && activeStudio.packages.length > 0 && (
                                                            <div>
                                                                <p className="text-sm text-gray-400 mb-1.5">Сонгосон багц</p>
                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                                    {activeStudio.packages.map(pkg => (
                                                                        <button key={pkg.id} type="button" onClick={() => handlePackageSelect(activeStudio.id, pkg)}
                                                                            className={`py-2 px-3 text-xs text-center rounded-lg border transition-all ${selectedPackages[activeStudio.id]?.id === pkg.id ? "bg-rose-600/10 border-rose-600 text-rose-600" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>
                                                                            <div className="font-semibold">{pkg.hours} цаг</div>
                                                                            <div className="mt-0.5">{Number(pkg.price).toLocaleString()}₮</div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {hasExtraHourOption && currentPackage && (
                                                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-lg mt-2">
                                                                <input 
                                                                    type="checkbox" 
                                                                    id="extraHourCheck" 
                                                                    checked={extraHoursChecked} 
                                                                    onChange={(e) => {
                                                                        setExtraHoursChecked(e.target.checked);
                                                                        setForm(prev => ({ ...prev, endTime: "" }));
                                                                    }}
                                                                    className="w-4 h-4 rounded border-gray-600 text-rose-600 focus:ring-rose-600 focus:ring-offset-gray-900 bg-gray-700 cursor-pointer"
                                                                />
                                                                <label htmlFor="extraHourCheck" className="text-sm text-gray-300 cursor-pointer flex-1 flex justify-between items-center select-none">
                                                                    <span>Нэмэлт 1 цаг авах</span>
                                                                    <span className="text-white font-semibold text-xs bg-rose-600/20 text-rose-500 px-2 py-1 rounded">+{extraPrice.toLocaleString()}₮</span>
                                                                </label>
                                                            </div>
                                                        )}

                                                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className={cn("w-full justify-start gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-10", !form.date && "text-gray-500")}>
                                                                    <CalendarIcon className="h-4 w-4 shrink-0 text-gray-500" />
                                                                    <span>{form.date ? format(form.date, "yyyy-MM-dd") : "Огноо сонгох"}</span>
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 bg-[#111] border-white/10 z-[200]" align="start">
                                                                <Calendar mode="single" selected={form.date} onSelect={d => { setForm({ ...form, date: d }); setCalendarOpen(false); }} className="bg-[#111] text-white" />
                                                            </PopoverContent>
                                                        </Popover>

                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-sm text-gray-400">Цаг сонгох</p>
                                                                {loadingSlots && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />}
                                                            </div>
                                                            {!form.date ? (
                                                                <p className="text-xs text-gray-600 italic">Эхлээд огноо сонгоно уу</p>
                                                            ) : (
                                                                <>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <p className="text-xs text-gray-500 mb-1">Эхлэх цаг</p>
                                                                            <select
                                                                                value={form.time}
                                                                                onChange={e => {
                                                                                    const t = e.target.value;
                                                                                    if (!isStartTimeDisabled(t)) {
                                                                                        setForm(prev => ({ ...prev, time: t, endTime: "" }));
                                                                                    }
                                                                                }}
                                                                                className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-600 cursor-pointer"
                                                                            >
                                                                                <option value="">-- : --</option>
                                                                                {HALF_HOURLY_TIMES.map(t => {
                                                                                    const disabled = isStartTimeDisabled(t);
                                                                                    return (
                                                                                        <option
                                                                                            key={t}
                                                                                            value={t}
                                                                                            disabled={disabled}
                                                                                            className={disabled ? "bg-[#1a1a1a] text-gray-600" : "bg-[#1a1a1a] text-white"}
                                                                                        >
                                                                                            {disabled ? `${t} — Захиалгатай` : t}
                                                                                        </option>
                                                                                    );
                                                                                })}
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-gray-500 mb-1">Дуусах цаг</p>
                                                                            <select
                                                                                value={form.endTime}
                                                                                disabled={!form.time}
                                                                                onChange={e => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                                                                                className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                                            >
                                                                                <option value="">-- : --</option>
                                                                                {HALF_HOURLY_TIMES.filter(t => {
                                                                                    if (!form.time) return false;
                                                                                    const [sh, sm] = form.time.split(":").map(Number);
                                                                                    const [th, tm] = t.split(":").map(Number);
                                                                                    const startMins = sh * 60 + sm;
                                                                                    let candidateMins = th * 60 + tm;
                                                                                    if (candidateMins <= startMins) candidateMins += 24 * 60;
                                                                                    if (currentPackage) {
                                                                                        const diffMins = candidateMins - startMins;
                                                                                        if (diffMins % 60 !== 0) return false;
                                                                                        const diffHrs = diffMins / 60;
                                                                                        if (diffHrs < 1 || diffHrs > currentDuration) return false;
                                                                                    }
                                                                                    for (let m = startMins; m < candidateMins; m += 30) {
                                                                                        const checkH = Math.floor(m / 60) % 24;
                                                                                        const checkM = m % 60;
                                                                                        const checkStr = `${String(checkH).padStart(2, "0")}:${checkM === 0 ? "00" : "30"}`;
                                                                                        if (bookedTimes.includes(checkStr)) return false;
                                                                                    }
                                                                                    return true;
                                                                                }).map(t => (
                                                                                    <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    {(() => {
                                                                        if (!form.time || !currentPackage) return null;
                                                                        const [sh, sm] = form.time.split(":").map(Number);
                                                                        const startMins = sh * 60 + sm;
                                                                        let maxAvailable = currentDuration;
                                                                        let hitConflict = false;
                                                                        for (let hrs = 1; hrs <= currentDuration; hrs++) {
                                                                            const candidateMins = startMins + hrs * 60;
                                                                            for (let m = startMins; m < candidateMins; m += 30) {
                                                                                const checkH = Math.floor(m / 60) % 24;
                                                                                const checkM = m % 60;
                                                                                const checkStr = `${String(checkH).padStart(2, "0")}:${checkM === 0 ? "00" : "30"}`;
                                                                                if (bookedTimes.includes(checkStr)) {
                                                                                    hitConflict = true;
                                                                                    maxAvailable = hrs - 1;
                                                                                    break;
                                                                                }
                                                                            }
                                                                            if (hitConflict) break;
                                                                        }
                                                                        if (maxAvailable > 0 && maxAvailable < currentDuration) {
                                                                            return (
                                                                                <p className="text-xs text-rose-500 mt-2 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                                                                                    ⚠️ Тухайн цагт давхардсан захиалга байгаа тул та хамгийн ихдээ {maxAvailable} цаг сонгох боломжтой байна.
                                                                                </p>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                    {form.time && form.endTime && calcDuration(form.time, form.endTime) > 0 && (
                                                                        <p className="text-xs text-gray-500 mt-1.5">
                                                                            Нийт хугацаа: <span className="text-white font-medium">{calcDuration(form.time, form.endTime)} цаг</span>
                                                                        </p>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                                                            <span className="text-gray-400 text-sm">Нийт үнэ:</span>
                                                            <span className="text-xl font-bold text-white">
                                                                {currentTotalPrice.toLocaleString()}₮
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                            <Button type="button" onClick={handleAddToCart} disabled={submitting} variant="outline" className="flex-1 h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 font-semibold gap-2">
                                                                Сагсанд нэмэх
                                                            </Button>
                                                            <Button type="button"
                                                                onClick={() => {
                                                                    if (validateForm(true)) {
                                                                        if (currentPackage && form.time && form.endTime) {
                                                                            const durationHrs = calcDuration(form.time, form.endTime);
                                                                            const maxHrs = currentDuration;
                                                                            if (maxHrs > 0 && durationHrs > maxHrs) {
                                                                                toast.error(`Сонгосон багц ${maxHrs} цагийн хязгаартай. ${durationHrs} цаг сонгох боломжгүй.`);
                                                                                return;
                                                                            }
                                                                        }
                                                                        setShowPaymentModal(true);
                                                                    }
                                                                }}
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
            </div>

            <PaymentMethodModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSelectQpay={() => { handleBuyNow("qpay"); }}
                onSelectInvoice={() => { handleBuyNow("invoice"); }}
                loading={submitting}
                amount={currentTotalPrice || undefined}
            />
        </div>
    );
}
