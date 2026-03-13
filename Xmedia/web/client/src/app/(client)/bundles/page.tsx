"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PackageCheck, ArrowLeft, Calendar as CalendarIcon, Loader2, Info, Check, GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth";
import { useCartStore } from "@/lib/store/cart";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { loadCustomerInfo, saveCustomerInfo } from "@/lib/customer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type BundleEquipment = { equipment: { name: string } };

interface BundleService {
    id: number;
    name: string;
    description: string;
    price: number | string;
    image: string;
    includedServices: string[];
    amenities: string[];
    equipments: BundleEquipment[];
}

export default function BundlesPage() {
    const { user } = useAuthStore();
    const { addItem } = useCartStore();

    const [bundles, setBundles] = useState<BundleService[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBundleId, setActiveBundleId] = useState<number | null>(null);

    // Booking Flow State
    const [isBooking, setIsBooking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [form, setForm] = useState({
        date: undefined as Date | undefined,
        name: "", phone: "", email: ""
    });

    useEffect(() => {
        fetch(`${API}/bundle-services`)
            .then(res => res.json())
            .then(data => {
                const fetched = Array.isArray(data) ? data : data.data || [];
                // Only show active bundles (managed by backend, but we filter if needed)
                setBundles(fetched);
                if (fetched.length > 0) setActiveBundleId(fetched[0].id);
            })
            .catch(() => toast.error("Мэдээлэл татахад алдаа гарлаа."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                name: user.name || "",
                phone: user.phone || "",
                email: user.email || ""
            }));
        } else {
            const info = loadCustomerInfo();
            if (info) {
                setForm(prev => ({ ...prev, name: info.name || prev.name, phone: info.phone || prev.phone, email: info.email || prev.email }));
            }
        }
    }, [user]);

    const activeBundle = bundles.find(b => b.id === activeBundleId);

    const validateForm = (isBuyNow: boolean = false) => {
        if (isBuyNow) {
            if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
                toast.error("Мэдээллээ бүрэн оруулна уу (Нэр, Утас, Имэйл).");
                return false;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.email.trim())) {
                toast.error("Имэйл хаягаа зөв оруулна уу.");
                return false;
            }
            
            const phoneRegex = /^[0-9]{8}$/;
            if (!phoneRegex.test(form.phone.trim())) {
                toast.error("Утасны дугаар 8 оронтой тоо байх ёстой.");
                return false;
            }
        }
        if (!form.date) {
            toast.error("Огноогоо сонгоно уу.");
            return false;
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!validateForm() || !activeBundle) return;

        addItem({
            serviceType: "BUNDLE_SERVICE",
            serviceId: activeBundle.id,
            serviceName: activeBundle.name,
            date: format(form.date!, "yyyy-MM-dd"),
            time: "00:00", // Bundles aren't necessarily time-bound perfectly like single services
            duration: 1, // Default to 1
            unitPrice: Number(activeBundle.price)
        });

        toast.success("Сагсанд нэмэгдлээ!", { description: "Та сагс руугаа орж төлбөрөө төлнө үү." });
        closeBooking();
    };

    const handleBuyNow = async (paymentType: "qpay" | "invoice") => {
        if (!validateForm(true) || !activeBundle) return;

        if (!user) {
            saveCustomerInfo({ name: form.name, phone: form.phone, email: form.email });
        }

        setSubmitting(true);
        try {
            const payload = {
                name: form.name,
                phone: form.phone,
                email: form.email,
                date: format(form.date!, "yyyy-MM-dd"),
                time: "00:00", // Defaulting time for bundles
                duration: 1,
                serviceType: "BUNDLE_SERVICE",
                serviceId: activeBundle.id,
                unitPrice: Number(activeBundle.price),
                serviceName: activeBundle.name,
                paymentType,
                ...(user && user.id ? { userId: parseInt(user.id, 10) } : {})
            };

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
                ? "Нэхэмжлэхийг таны имэйл рүү явууллаа."
                : "Удахгүй холбогдох болно.";
            toast.success("Захиалга амжилттай бүртгэгдлээ!", { description: desc });
            closeBooking();
        } catch {
            toast.error("Захиалга бүртгэхэд алдаа гарлаа.");
        } finally {
            setSubmitting(false);
            setShowPaymentModal(false);
        }
    };

    const closeBooking = () => {
        setIsBooking(false);
        setForm(prev => ({ ...prev, date: undefined, name: "", phone: "", email: "" }));
    };

    const handleTabChange = (id: number) => {
        setActiveBundleId(id);
        setIsBooking(false);
        setForm(prev => ({ ...prev, date: undefined, name: "", phone: "", email: "" }));
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-rose-600/20 hover:bg-rose-600/30 blur-[120px] rounded-full pointer-events-none opacity-50 transition-opacity duration-700" />
            <div className="pt-28 md:pt-36 pb-24 relative z-10">
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

                    {loading ? (
                        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-rose-600" /></div>
                    ) : bundles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <PackageCheck className="w-16 h-16 text-gray-500" />
                            <p className="text-gray-500 text-center">Одоогоор багц үйлчилгээ нэмэгдээгүй байна.</p>
                        </div>
                    ) : activeBundle && (
                        <div className="space-y-12">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16">

                                {/* Image Side */}
                                <div className={`relative h-[300px] lg:h-[600px] lg:w-1/2 flex-shrink-0 rounded-[24px] overflow-hidden ${isBooking ? 'hidden lg:block' : ''}`}>
                                    {activeBundle.image ? (
                                        <motion.div key={activeBundle.image} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url('${activeBundle.image}')` }} />
                                    ) : (
                                        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                                            <PackageCheck className="w-16 h-16 text-zinc-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Content Side */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <AnimatePresence mode="wait">
                                        {!isBooking ? (
                                            <motion.div key={`detail-${activeBundle.id}`} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex flex-col h-full py-4">

                                                {bundles.length > 1 && (
                                                    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 border border-white/10 rounded-[16px]">
                                                        {bundles.map(b => (
                                                            <button
                                                                key={b.id}
                                                                onClick={() => handleTabChange(b.id)}
                                                                className={`flex-1 py-2.5 px-4 rounded-[12px] text-sm font-semibold transition-all ${activeBundleId === b.id ? 'bg-[#1a1a1a] text-white shadow-md border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                            >
                                                                {b.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex w-fit items-center gap-2 px-2.5 py-1 bg-rose-600/10 text-rose-600 border border-rose-600/20 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase">
                                                            <PackageCheck className="w-3.5 h-3.5" /> Багц Үйлчилгээ
                                                        </div>
                                                        <Link href="/portfolio/bundle">
                                                            <Button variant="outline" className="text-rose-600 hover:text-white hover:bg-rose-600/20 border-rose-600/50 bg-rose-600/10 px-3 py-1.5 h-auto gap-2 text-xs md:text-sm animate-pulse shadow-[0_0_15px_hsla(var(--primary),0.5)] transition-all duration-300">
                                                                <GalleryVerticalEnd className="w-3.5 h-3.5 text-rose-600" />
                                                                Өмнөх ажлууд харах
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>

                                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{activeBundle.name}</h2>
                                                {activeBundle.description && (
                                                    <p className="text-gray-400 mb-6 leading-relaxed text-sm md:text-base">{activeBundle.description}</p>
                                                )}

                                                {/* Included Services */}
                                                {(activeBundle.includedServices && activeBundle.includedServices.length > 0) && (
                                                    <div className="mb-6 w-full">
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                            <Check className="w-4 h-4 text-rose-600" />Багцад багтсан үйлчилгээ
                                                        </h4>
                                                        <div className="flex flex-col gap-1.5">
                                                            {activeBundle.includedServices.map((svc, i) => (
                                                                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                                                                    <span>{svc}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Amenities */}
                                                {(activeBundle.amenities && activeBundle.amenities.length > 0) && (
                                                    <div className="mb-6 w-full">
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                            <Info className="w-4 h-4 text-rose-600" />Давуу талууд
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {activeBundle.amenities.map((amenity, i) => (
                                                                <span key={i} className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10">
                                                                    <Check className="w-3.5 h-3.5 text-rose-600" />
                                                                    {amenity}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Equipment */}
                                                {(activeBundle.equipments && activeBundle.equipments.length > 0) && (
                                                    <div className="mb-6 w-full">
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                            Тоног төхөөрөмж
                                                        </h4>
                                                        <div className="bg-[#141414] p-4 rounded-xl border border-white/5">
                                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {activeBundle.equipments.map((eq, i) => (
                                                                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400">
                                                                        <div className="w-1 h-1 rounded-full bg-gray-500 shrink-0 mt-[5px]" />
                                                                        <span className="flex-1 leading-snug">{eq.equipment?.name}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                                                    <div className="flex flex-col items-start md:items-center">
                                                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Багцын үнэ</p>
                                                        <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{Number(activeBundle.price).toLocaleString()} ₮</p>
                                                    </div>
                                                    <Button onClick={() => setIsBooking(true)} className="w-full md:w-auto px-8 h-12 bg-rose-600 hover:bg-rose-600/90 font-semibold rounded-xl text-white shadow-lg shadow-primary/20">
                                                        Захиалга өгөх
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div key={`booking-${activeBundle.id}`} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="h-full flex flex-col py-4">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-3">
                                                        <Button variant="ghost" size="icon" onClick={() => setIsBooking(false)} className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
                                                        <h2 className="text-xl font-bold line-clamp-1">Багц авах — <span className="text-rose-600">{activeBundle.name}</span></h2>
                                                    </div>
                                                </div>

                                                <div className="space-y-6 flex-1">
                                                    <div className="space-y-4 rounded-xl bg-white/5 border border-white/10 p-5">
                                                        <p className="text-sm font-medium text-white mb-2">Захиалагчийн мэдээлэл</p>
                                                        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-[#1a1a1a] border-white/5 text-white h-11 rounded-lg" placeholder="Таны нэр *" />
                                                        <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-[#1a1a1a] border-white/5 text-white h-11 rounded-lg" placeholder="Утасны дугаар *" />
                                                        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-[#1a1a1a] border-white/5 text-white h-11 rounded-lg" placeholder="Имэйл хаяг *" />
                                                    </div>

                                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                        <p className="text-sm text-gray-400 mb-1">Захиалгын төрөл</p>
                                                        <p className="text-lg font-semibold text-white">{activeBundle.name}</p>
                                                        <p className="text-md text-rose-600 font-bold mt-2">{Number(activeBundle.price).toLocaleString()} ₮</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-gray-400 mb-2">Хэзээ ашиглах вэ? <span className="text-rose-600">*</span></p>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className={cn("w-full justify-start gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-12 rounded-xl", !form.date && "text-gray-500")}>
                                                                    <CalendarIcon className="h-4 w-4 shrink-0 text-gray-500" />
                                                                    <span>{form.date ? format(form.date, "yyyy-MM-dd") : "Огноо сонгох"}</span>
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 bg-[#111] border-white/10 z-[200]" align="start">
                                                                <Calendar mode="single" selected={form.date} onSelect={d => setForm({ ...form, date: d })} className="bg-[#111] text-white" />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <p className="text-xs text-gray-500 mt-2 italic">* Цагийн дэлгэрэнгүй хуваарийг манай баг холбогдож тохиролцох болно.</p>
                                                    </div>

                                                    <div className="pt-6 border-t border-white/10 mt-auto">
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <Button type="button" onClick={handleAddToCart} disabled={submitting} variant="outline" className="flex-1 h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 font-semibold gap-2 rounded-xl">
                                                                Сагсанд нэмэх
                                                            </Button>
                                                            <Button type="button"
                                                                onClick={() => { if (validateForm(true)) setShowPaymentModal(true); }}
                                                                disabled={submitting}
                                                                className="flex-1 h-12 bg-rose-600 hover:bg-rose-600/90 font-semibold text-white rounded-xl shadow-lg shadow-primary/20">
                                                                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Уншиж байна...</> : "Шууд авах"}
                                                            </Button>
                                                        </div>
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
                onSelectQpay={() => { handleBuyNow("qpay"); }}
                onSelectInvoice={() => { handleBuyNow("invoice"); }}
                loading={submitting}
            />
        </div>
    );
}
