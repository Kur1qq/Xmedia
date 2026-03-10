"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, Mic2, MonitorPlay, Check, Users, Square, Info, ArrowLeft, Calendar as CalendarIcon, Loader2, Sparkles, Star, Shield, ArrowRight, HelpCircle, ChevronDown, ChevronUp, GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cart";
import { fetchBookedSlots, isTimeDisabled, ALL_TIMES } from "@/lib/booking-slots";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";

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
}

export default function StudiosPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [studios, setStudios] = useState<Studio[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [selectedPackages, setSelectedPackages] = useState<Record<number, StudioPackage>>({});
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ date: undefined as Date | undefined, time: "", name: "", phone: "", email: "" });
    const [bookedTimes, setBookedTimes] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { addItem } = useCartStore();

    useEffect(() => {
        fetch(`${API}/studio`)
            .then(r => r.json())
            .then(data => {
                const fetchedStudios = Array.isArray(data) ? data : data.data ?? data.items ?? [];
                setStudios(fetchedStudios);
                if (fetchedStudios.length > 0) setActiveServiceId(fetchedStudios[0].id);
            })
            .catch(() => toast.error("Студиудын мэдээлэл татахад алдаа гарлаа."))
            .finally(() => setLoading(false));
    }, []);

    const activeStudio = studios.find(s => s.id === activeServiceId);
    const currentPackage = activeStudio ? selectedPackages[activeStudio.id] : null;

    useEffect(() => {
        if (user) {
            setForm(prev => ({ ...prev, name: user.name || "", phone: user.phone || "", email: user.email || "" }));
        }
    }, [user]);

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
        // If booking form is open and package changes to one with different duration, clear chosen time
        if (isBooking) {
            setForm(prev => ({ ...prev, time: "" }));
        }
    };

    const handleTabChange = (id: number) => {
        setActiveServiceId(id);
        setIsBooking(false);
        setForm(prev => ({ ...prev, date: undefined, time: "", name: "", phone: "", email: "" }));
    };

    const validateForm = (isBuyNow: boolean = false) => {
        if (isBuyNow) {
            if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) { toast.error("Мэдээллээ бүрэн оруулна уу (Нэр, Утас, Имэйл)."); return false; }
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
            serviceName: activeStudio.name,
            date: format(form.date!, "yyyy-MM-dd"),
            time: form.time,
            duration: currentPackage.hours,
            unitPrice: Number(currentPackage.price) / currentPackage.hours, // hourly rate
        });
        toast.success("Сагсанд нэмэгдлээ!", { description: "Та сагс руугаа орж төлбөрөө төлнө үү." });
        closeBooking();
    };

    const handleBuyNow = async (paymentType: "qpay" | "invoice", orgInfo?: { orgName: string; orgReg: string; orgAddress: string; orgPhone: string }) => {
        if (!validateForm(true) || !activeStudio || !currentPackage) return;

        setSubmitting(true);
        try {
            const payload: any = {
                name: form.name,
                phone: form.phone,
                email: form.email,
                date: format(form.date!, "yyyy-MM-dd"), time: form.time,
                duration: currentPackage.hours,
                serviceType: "STUDIO", serviceId: activeStudio.id,
                unitPrice: Number(currentPackage.price) / currentPackage.hours,
                serviceName: activeStudio.name,
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

    const closeBooking = () => { setIsBooking(false); setForm(prev => ({ ...prev, date: undefined, time: "", name: "", phone: "", email: "" })); };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-rose-600/20 hover:bg-rose-600/30 blur-[120px] rounded-full pointer-events-none opacity-50 transition-opacity duration-700" />

            <div className="pt-24 md:pt-36 pb-12 md:pb-24 relative z-10">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                        </div>
                    ) : studios.length === 0 ? (
                        <p className="text-gray-500 text-center py-24">Одоогоор студи нэмэгдээгүй байна.</p>
                    ) : activeStudio && (
                        <div className="space-y-12">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16">

                                <div className={`relative h-[300px] lg:h-[600px] lg:w-1/2 flex-shrink-0 rounded-[24px] overflow-hidden ${isBooking ? 'hidden lg:block' : ''}`}>
                                    {getImage(activeStudio)
                                        ? <motion.div key={getImage(activeStudio)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${getImage(activeStudio)}')` }} />
                                        : <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center"><Camera className="w-16 h-16 text-zinc-600" /></div>
                                    }
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    <AnimatePresence mode="wait">
                                        {!isBooking ? (
                                            <motion.div key={`detail-${activeStudio.id}`} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex flex-col h-full py-4">

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

                                                <div className="flex flex-wrap gap-4 items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex w-fit items-center gap-2 px-2.5 py-1 bg-rose-600/10 text-rose-600 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase">
                                                            Photography Studio
                                                        </div>
                                                        <Link href="/portfolio/studio">
                                                            <Button variant="outline" className="text-rose-600 hover:text-white hover:bg-rose-600/20 border-rose-600/50 bg-rose-600/10 px-3 py-1.5 h-auto gap-2 text-xs md:text-sm animate-pulse shadow-[0_0_15px_hsla(var(--primary),0.5)] transition-all duration-300">
                                                                <GalleryVerticalEnd className="w-3.5 h-3.5 text-rose-600" />
                                                                Өмнөх ажлууд харах
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3">
                                                        {activeStudio.sizeSqm && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Square className="w-3.5 h-3.5 text-gray-400" />
                                                                <span className="text-sm text-gray-300">{Number(activeStudio.sizeSqm)}m²</span>
                                                            </div>
                                                        )}
                                                        {activeStudio.capacity && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                                                <span className="text-sm text-gray-300">{activeStudio.capacity}-{Number(activeStudio.capacity) + 5} хүн</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{activeStudio.name}</h2>
                                                <Link
                                                    href="https://www.google.com/maps/place/XTUDIO/@48.0082871,106.9214316,671m/data=!3m1!1e3!4m6!3m5!1s0x694d69c46d9c5945:0xc9e3c9408887d71f!8m2!3d48.0082871!4d106.9240065!16s%2Fg%2F11ww0jglbw!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDMwNC4xIKXMDSoASAFQAw%3D%3D"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-fit mb-4 block"
                                                >
                                                    <Button variant="outline" className="text-gray-300 hover:text-white hover:bg-white/10 border-white/20 bg-white/5 px-3 py-1.5 h-auto gap-2 text-xs md:text-sm transition-all duration-300 tracking-wide text-left">
                                                        <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                                                        <span className="line-clamp-2">Байршил: 1, CHD - 24 khoroo, Shadivlan, Ulaanbaatar 15020</span>
                                                    </Button>
                                                </Link>
                                                <p className="text-gray-400 mb-5 leading-relaxed text-sm md:text-base">{activeStudio.description}</p>

                                                {(activeStudio.amenities && activeStudio.amenities.length > 0) && (
                                                    <div className="mb-5 w-full">
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                            <Info className="w-3.5 h-3.5 text-rose-600" />Онцлог талууд
                                                        </h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {activeStudio.amenities.map((amenity, i) => (
                                                                <div key={i} className="flex items-center gap-2.5 text-xs text-gray-200 bg-[#141414] px-3 py-2 rounded-lg border border-white/5 truncate">
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
                                                    <div className="mb-6 w-full mt-auto pt-4">
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                            Үнийн багцууд
                                                        </h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            {activeStudio.packages.map((pkg) => {
                                                                const isSelected = selectedPackages[activeStudio.id]?.id === pkg.id;
                                                                return (
                                                                    <div
                                                                        key={pkg.id}
                                                                        onClick={() => handlePackageSelect(activeStudio.id, pkg)}
                                                                        className={`cursor-pointer p-4 rounded-xl border relative transition-all flex flex-col items-center justify-center ${isSelected ? 'border-rose-600 bg-rose-600/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
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

                                                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                                                    <div className="flex flex-col items-start md:items-center">
                                                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Нийт</p>
                                                        <p className="text-2xl font-bold">
                                                            {selectedPackages[activeStudio.id] ? `${Number(selectedPackages[activeStudio.id].price).toLocaleString()}₮` : 'Багц сонгоно уу'}
                                                        </p>
                                                    </div>
                                                    <Button onClick={() => {
                                                        setIsBooking(true);
                                                    }} disabled={activeStudio.packages?.length > 0 && !selectedPackages[activeStudio.id]} className="w-full md:w-auto px-8 h-12 bg-rose-600 hover:bg-rose-600/90 font-semibold rounded-lg transition-all text-white">Захиалга өгөх</Button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div key={`booking-${activeStudio.id}`} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="flex flex-col h-full py-4">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <Button variant="ghost" size="icon" onClick={() => closeBooking()} className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
                                                    <h2 className="text-xl font-bold text-white line-clamp-1">Захиалга өгөх — <span className="text-rose-600">{activeStudio.name}</span></h2>
                                                </div>
                                                <div className="space-y-4 flex-1">
                                                    <div className="space-y-3 rounded-lg bg-white/5 border border-white/10 p-4">
                                                        <p className="text-sm text-white font-medium">Захиалагчийн мэдээлэл</p>
                                                        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Таны нэр *" />
                                                        <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Утасны дугаар *" />
                                                        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Имэйл хаяг *" />
                                                    </div>
                                                    {activeStudio.packages && activeStudio.packages.length > 0 && (
                                                        <div>
                                                            <p className="text-sm text-gray-400 mb-2">Сонгосон багц</p>
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
                                                    <div>
                                                        <p className="text-sm text-gray-400 mb-2">
                                                            Эхлэх цаг
                                                            {loadingSlots && <span className="ml-2 text-xs text-gray-500">Шалгаж байна...</span>}
                                                        </p>
                                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                            {ALL_TIMES.map(t => {
                                                                const duration = selectedPackages[activeStudio.id]?.hours ?? 1;
                                                                const disabled = isTimeDisabled(t, bookedTimes, duration);
                                                                return (
                                                                    <button
                                                                        key={t}
                                                                        type="button"
                                                                        disabled={disabled}
                                                                        onClick={() => !disabled && setForm({ ...form, time: t })}
                                                                        title={disabled ? "Захиалагдсан" : undefined}
                                                                        className={`py-2 text-xs rounded-lg border transition-all relative ${disabled
                                                                            ? "bg-white/5 border-white/5 text-gray-600 cursor-not-allowed opacity-40 line-through"
                                                                            : form.time === t
                                                                                ? "bg-rose-600/10 border-rose-600 text-rose-600"
                                                                                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                                                                            }`}
                                                                    >{t}</button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                                                        <span className="text-gray-400 text-sm">Нийт үнэ:</span>
                                                        <span className="text-xl font-bold text-white">{selectedPackages[activeStudio.id] ? Number(selectedPackages[activeStudio.id].price).toLocaleString() : 0}₮</span>
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


            {/* Payment Method Modal */}
            <PaymentMethodModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSelectQpay={() => handleBuyNow("qpay")}
                onSelectInvoice={(orgInfo) => handleBuyNow("invoice", orgInfo)}
                loading={submitting}
                amount={currentPackage ? Number(currentPackage.price) : undefined}
            />
        </div>
    );
}
