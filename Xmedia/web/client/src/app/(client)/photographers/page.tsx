"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, ArrowLeft, Calendar as CalendarIcon, Phone, User, Loader2, Info, Check, GalleryVerticalEnd, Mail } from "lucide-react";
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
import { fetchBookedSlots, HALF_HOURLY_TIMES } from "@/lib/booking-slots";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface PhotographerServicePackage {
    id: number;
    subTypeId: number;
    price: number;
    duration: number;
    priceLabel?: string;
    subType?: { id: number; name: string; price?: number; sortOrder?: number };
}

interface PhotographerService {
    id: number;
    name: string;
    description: string;
    image: string;
    category?: { name: string };
    mainType?: { name: string };
    equipments?: { equipment: { name: string; type?: string } }[];
    amenities?: string[];
    packages?: PhotographerServicePackage[];
}

export default function PhotographersPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [services, setServices] = useState<PhotographerService[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [selectedSubTypes, setSelectedSubTypes] = useState<Record<number, number>>({});
    const [selectedPackages, setSelectedPackages] = useState<Record<number, PhotographerServicePackage>>({});
    const [batteryCount, setBatteryCount] = useState<number>(1);
    const [photographerCount, setPhotographerCount] = useState<number>(1);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ date: undefined as Date | undefined, time: "", endTime: "", duration: "1", name: "", phone: "", email: "" });

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
        fetch(`${API}/photographer-services`)
            .then(r => r.json())
            .then(data => {
                const fetchedServices = Array.isArray(data) ? data : data.data ?? data.items ?? [];
                setServices(fetchedServices);
                if (fetchedServices.length > 0) setActiveServiceId(fetchedServices[0].id);
            })
            .catch(() => toast.error("Мэдээлэл татахад алдаа гарлаа."))
            .finally(() => setLoading(false));
    }, []);

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

    const activeService = services.find(s => s.id === activeServiceId);
    const currentPackage = activeService ? selectedPackages[activeService.id] : null;

    let activeSubTypeId = activeService ? selectedSubTypes[activeService.id] : null;
    if (activeService?.packages && !activeSubTypeId) {
        const cTypes = Array.from(
            new Map(activeService.packages.filter(p => p.subType && p.subType.name !== 'Сурталчилгаа').map(p => [p.subType!.id, p.subType!])).values()
        ).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
        if (cTypes.length > 0) activeSubTypeId = cTypes[0].id;
    }

    const subTypeName = activeService?.packages?.find(p => p.subTypeId === activeSubTypeId)?.subType?.name?.toLowerCase() || '';
    const isDroneBattery = activeService?.name === 'Дрон' && 
        (subTypeName.includes('батерэй') || subTypeName.includes('батарей'));
    const isPhotographer = activeService?.name === 'Зурагчин';
    const isVideographer = activeService?.name === 'Зураглаач';
    const isPersonService = isPhotographer || isVideographer;

    useEffect(() => {
        if (!form.date || !activeService || !isBooking) { setBookedTimes([]); return; }
        setLoadingSlots(true);
        setForm(prev => ({ ...prev, time: "" }));
        fetchBookedSlots("PHOTOGRAPHER_SERVICE", activeService.id, format(form.date, "yyyy-MM-dd"))
            .then(setBookedTimes)
            .finally(() => setLoadingSlots(false));
    }, [form.date, isBooking, activeService?.id]);

    const handlePackageSelect = (serviceId: number, pkg: PhotographerServicePackage) => {
        setSelectedPackages(prev => ({ ...prev, [serviceId]: pkg }));
        if (isBooking) {
            setForm(prev => ({ ...prev, time: "" }));
        }
    };
    const handleSubTypeSelect = (serviceId: number, subTypeId: number) => {
        setSelectedSubTypes(prev => ({ ...prev, [serviceId]: subTypeId }));
        // Auto select first package of this subtype
        const firstPkg = activeService?.packages?.find(p => p.subTypeId === subTypeId);
        if (firstPkg) handlePackageSelect(serviceId, firstPkg);
    };

    const handleTabChange = (id: number) => {
        setActiveServiceId(id);
        setIsBooking(false);
        setForm(prev => ({ ...prev, date: undefined, time: "", duration: "1" }));
        setPhotographerCount(1);
    };

    const validateForm = (isBuyNow: boolean = false) => {
        if (isBuyNow) {
            if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) { toast.error("Мэдээллээ бүрэн оруулна уу (Нэр, Утас, Имэйл)."); return false; }

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
        if (!form.time) { toast.error("Цагаа сонгоно уу."); return false; }
        if (!form.date) { toast.error("Огноогоо сонгоно уу."); return false; }

        // Use the globally defined isDroneBattery
        if (activeService?.packages && activeService.packages.length > 0 && !currentPackage && !isDroneBattery) {
            toast.error("Багц сонгоно уу.");
            return false;
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!validateForm() || !activeService) return;

        let duration = parseInt(currentPackage?.duration?.toString() || "1", 10);
        let totalAmount = Number(currentPackage?.price || 0);
        let serviceName = activeService.name;

        let timePayload = form.time;

        if (!isDroneBattery && !isPersonService) {
            // duration stays as package duration, price stays as package price
            duration = parseInt(currentPackage?.duration?.toString() || "1", 10);
        }

        // Special case for Drone Battery
        if (isDroneBattery) {
            duration = 1; // logical duration per battery or fixed
            totalAmount = 150000 * batteryCount;
            serviceName = `Дрон (Батерэй ${batteryCount}ш)`;
            timePayload = form.time;
        }

        // Special case for Person count (Photographer / Videographer)
        if (isPersonService) {
            totalAmount = totalAmount * photographerCount;
            serviceName = `${activeService.name}${photographerCount > 1 ? ` (${photographerCount}ш)` : ''}`;
        }

        addItem({
            serviceType: "PHOTOGRAPHER_SERVICE",
            serviceId: activeService.id,
            serviceName: serviceName,
            date: format(form.date!, "yyyy-MM-dd"),
            time: timePayload,
            duration: duration,
            unitPrice: totalAmount / duration,
        });

        toast.success("Сагсанд нэмэгдлээ!", { description: "Та сагс руугаа орж төлбөрөө төлнө үү." });
        closeBooking();
    };

    const handleBuyNow = async (paymentType: "qpay" | "invoice") => {
        if (!validateForm(true) || !activeService) return;

        if (!user) {
            saveCustomerInfo({ name: form.name, phone: form.phone, email: form.email });
        }

        setSubmitting(true);
        try {
            let duration = parseInt(currentPackage?.duration?.toString() || "1", 10);
            let totalAmount = Number(currentPackage?.price || 0);
            let serviceName = activeService.name;

            let timePayload = form.time;

            if (!isDroneBattery && !isPersonService) {
                // duration stays as package duration, price stays as package price
                duration = parseInt(currentPackage?.duration?.toString() || "1", 10);
            }

            // Special case for Drone Battery
            if (isDroneBattery) {
                duration = 1;
                totalAmount = 150000 * batteryCount;
                serviceName = `Дрон (Батерэй ${batteryCount}ш)`;
                timePayload = form.time;
            }

            // Special case for Person count (Photographer / Videographer)
            if (isPersonService) {
                totalAmount = totalAmount * photographerCount;
                serviceName = `${activeService.name}${photographerCount > 1 ? ` (${photographerCount}ш)` : ''}`;
            }

            const payload: Record<string, unknown> = {
                name: form.name,
                phone: form.phone,
                email: form.email,
                date: format(form.date!, "yyyy-MM-dd"), time: timePayload,
                duration,
                serviceType: "PHOTOGRAPHER_SERVICE", serviceId: activeService.id,
                unitPrice: totalAmount / duration, // Backend expects unitPrice * duration = totalAmount
                serviceName: serviceName,
                paymentType,
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
                ? "Нэхэмжлэхийг таны имэйл рүү явууллаа."
                : "Удахгүй холбогдох болно.";
            toast.success("Захиалга амжилттай бүртгэгдлээ!", { description: desc });
            closeBooking();
        } catch {
            toast.error("Захиалга бүртгэхэд алдаа гарлаа.");
        } finally { setSubmitting(false); setShowPaymentModal(false); }
    };

    const closeBooking = () => { setIsBooking(false); setForm(prev => ({ ...prev, date: undefined, time: "", duration: "1" })); };

    return (
        <div className="h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-rose-600/20 hover:bg-rose-600/30 blur-[120px] rounded-full pointer-events-none opacity-50 transition-opacity duration-700" />
            <div className="flex-1 overflow-y-auto pt-20 pb-6 relative z-10 scrollbar-hide">
                <div className="min-h-full flex items-center justify-center py-8">
                    <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

                        {loading ? (
                            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-rose-600" /></div>
                        ) : services.length === 0 ? (
                            <p className="text-gray-500 text-center py-24">Одоогоор үйлчилгээ нэмэгдээгүй байна.</p>
                        ) : activeService && (
                            <div className="space-y-6 w-full">
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                    className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16">

                                    <div className={`relative h-[250px] lg:h-[450px] max-h-[50vh] lg:w-[45%] flex-shrink-0 rounded-[24px] flex items-center justify-center ${isBooking ? 'hidden lg:block' : ''}`}>
                                        {activeService.image
                                            ? <motion.img key={activeService.image} src={activeService.image} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-full max-h-full object-contain rounded-[24px]" />
                                            : <div className="w-full h-full rounded-[24px] bg-zinc-800 flex items-center justify-center"><ImageIcon className="w-16 h-16 text-zinc-600" /></div>
                                        }
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        <AnimatePresence mode="wait">
                                            {!isBooking ? (
                                                <motion.div key={`detail-${activeService.id}`} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex flex-col h-full py-4 pt-0">

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

                                                    <div className="flex items-center justify-between mb-3">
                                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-0">{activeService.name}</h2>
                                                        <Link href="/portfolio/photographer">
                                                            <div className="flex w-fit items-center gap-2 px-2.5 py-1 bg-rose-600/10 text-white rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase hover:bg-rose-600/20 transition-all cursor-pointer">
                                                                <GalleryVerticalEnd className="w-3 h-3" />
                                                                Өмнөх ажил
                                                            </div>
                                                        </Link>
                                                    </div>
                                                    <p className="text-gray-400 mb-6 leading-relaxed text-sm">{activeService.description}</p>

                                                    {(activeService.amenities && activeService.amenities.length > 0) && (
                                                        <div className="mb-6 w-full">
                                                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                                <Info className="w-4 h-4 text-rose-600" /> Онцлог талууд
                                                            </h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {activeService.amenities.map((amenity, i) => (
                                                                    <div key={i} className="flex items-center gap-2.5 text-xs text-gray-200 bg-white/5 px-3 py-2 rounded-lg border border-white/5 truncate">
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
                                                                <Info className="w-4 h-4 text-rose-600" /> Тоног төхөөрөмж
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

                                                    {activeService.packages && activeService.packages.length > 0 && (() => {
                                                        const contentTypes = Array.from(
                                                            new Map(activeService.packages.filter(p => p.subType && p.subType.name !== 'Сурталчилгаа').map(p => [p.subType!.id, p.subType!])).values()
                                                        ).sort((a: { sortOrder?: number }, b: { sortOrder?: number }) => (a.sortOrder || 0) - (b.sortOrder || 0));

                                                        const currentSubTypeId = activeSubTypeId;
                                                        const availablePackages = activeService.packages
                                                            .filter(p => (!currentSubTypeId || p.subTypeId === currentSubTypeId) && p.subType?.name !== 'Сурталчилгаа')
                                                            .sort((a, b) => a.duration - b.duration || Number(a.price) - Number(b.price));

                                                        return (
                                                            <div className="mb-6 w-full mt-auto pt-4 space-y-6">

                                                                {contentTypes.length > 0 && activeService.name !== 'Зурагчин' && (
                                                                    <div>
                                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm max-w-[80%] leading-relaxed">
                                                                            {activeService.name === 'Дрон'
                                                                                ? "1 ширхэг батарей 20 минут нисгэхэд ашиглагдана та өөрийн хэрэгцээнд тааруулан батарейн тоогоо сонгоно уу"
                                                                                : "Контентийн төрөл сонгох"}
                                                                        </h4>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {contentTypes.map((ct: { id: number; name: string }) => {
                                                                                const isSelected = ct.id === currentSubTypeId;
                                                                                return (
                                                                                    <div key={ct.id} className="flex items-center gap-4">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleSubTypeSelect(activeService.id, ct.id)}
                                                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSelected ? 'bg-rose-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                                                                                        >
                                                                                            {ct.name}
                                                                                        </button>

                                                                                        {activeService.name === 'Дрон' && (ct.name.toLowerCase().includes('батерэй') || ct.name.toLowerCase().includes('батарей')) && isSelected && (
                                                                                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                                                                                                <button
                                                                                                    onClick={() => setBatteryCount(Math.max(1, batteryCount - 1))}
                                                                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all text-xl font-medium"
                                                                                                >-</button>
                                                                                                <span className="w-8 text-center font-bold text-lg">{batteryCount}ш</span>
                                                                                                <button
                                                                                                    onClick={() => setBatteryCount(batteryCount + 1)}
                                                                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all text-xl font-medium"
                                                                                                >+</button>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {availablePackages.length > 0 && !isDroneBattery && (
                                                                    <div className="mb-4 w-full">
                                                                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                                                                            Үнийн багцууд
                                                                        </h4>
                                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                            {availablePackages.map(pkg => {
                                                                                const isSelected = (currentPackage?.id === pkg.id) || (!currentPackage && availablePackages[0].id === pkg.id);
                                                                                return (
                                                                                    <div
                                                                                        key={pkg.id}
                                                                                        onClick={() => handlePackageSelect(activeService.id, pkg)}
                                                                                        className={`cursor-pointer p-3 rounded-xl border relative transition-all flex flex-col items-center justify-center ${isSelected ? 'border-rose-600 bg-rose-600/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                                                                    >
                                                                                        {isSelected && <div className="absolute top-2 right-2"><Check className="w-3 h-3 text-rose-600" /></div>}
                                                                                        <p className="text-lg font-bold text-white mb-1">{pkg.duration} цаг</p>
                                                                                        <p className="text-gray-400 font-bold mt-1 text-xs">{Number(pkg.price).toLocaleString()}₮</p>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}

                                                    <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col items-start">
                                                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">Нийт үнэ</p>
                                                                <p className="text-2xl font-bold">
                                                                    {(() => {
                                                                        if (isDroneBattery) {
                                                                            return `${(150000 * batteryCount).toLocaleString()}₮`;
                                                                        }

                                                                        const thePkg = currentPackage || (activeService.packages && activeService.packages[0]);
                                                                        if (!thePkg) return "Сонгоно уу";
                                                                        const basePrice = Number(thePkg.price || 0);
                                                                        const multiplier = isPersonService ? photographerCount : 1;
                                                                        return `${(basePrice * multiplier).toLocaleString()}₮`;
                                                                    })()}
                                                                </p>
                                                            </div>
                                                            {isPersonService && (
                                                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                                                                    <button
                                                                        onClick={() => setPhotographerCount(Math.max(1, photographerCount - 1))}
                                                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all text-lg font-medium"
                                                                    >-</button>
                                                                    <span className="w-7 text-center font-bold text-sm">{photographerCount}ш</span>
                                                                    <button
                                                                        onClick={() => setPhotographerCount(photographerCount + 1)}
                                                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all text-lg font-medium"
                                                                    >+</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button onClick={() => {
                                                            if (activeService.packages && activeService.packages.length > 0 && !selectedPackages[activeService.id]) {
                                                                handlePackageSelect(activeService.id, activeService.packages[0]);
                                                            }
                                                            setIsBooking(true);
                                                        }} className="w-full md:w-auto px-8 h-12 bg-rose-600 hover:bg-rose-600/90 font-semibold rounded-lg transition-all text-white">Захиалга өгөх</Button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div key={`booking-${activeService.id}`} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="flex flex-col h-full py-4">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <Button variant="ghost" size="icon" onClick={() => closeBooking()} className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
                                                        <h2 className="text-xl font-bold line-clamp-1">Захиалга — <span className="text-rose-600">{activeService.name}</span></h2>
                                                    </div>
                                                    <div className="space-y-4 flex-1">
                                                        <div className="space-y-3 rounded-lg bg-white/5 border border-white/10 p-4">
                                                            <p className="text-sm text-white font-medium">Захиалагчийн мэдээлэл</p>
                                                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Таны нэр *" />
                                                            <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Утасны дугаар *" />
                                                            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white h-10" placeholder="Имэйл хаяг *" />
                                                        </div>
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
                                                                                    setForm({ ...form, time: t, endTime: "", duration: "1" });
                                                                                }}
                                                                                className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-600 cursor-pointer"
                                                                            >
                                                                                <option value="">-- : --</option>
                                                                                {HALF_HOURLY_TIMES.filter(t => {
                                                                                    if (bookedTimes.includes(t)) return false;
                                                                                    const dur = isDroneBattery ? 1 : (currentPackage?.duration || 0);
                                                                                    if (dur > 0) {
                                                                                        const [sh, sm] = t.split(":").map(Number);
                                                                                        const startMins = sh * 60 + sm;
                                                                                        // Here we check if the minimum 1 hr is available
                                                                                        const durMins = 60; // Just check if at least 1 hour is available
                                                                                        let endMins = startMins + durMins;
                                                                                        for (let m = startMins; m < endMins; m += 30) {
                                                                                            const checkH = Math.floor(m / 60) % 24;
                                                                                            const checkM = m % 60;
                                                                                            const checkStr = `${String(checkH).padStart(2, "0")}:${checkM === 0 ? "00" : "30"}`;
                                                                                            if (bookedTimes.includes(checkStr)) return false;
                                                                                        }
                                                                                    }
                                                                                    return true;
                                                                                }).map(t => (
                                                                                    <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        {!isDroneBattery && (
                                                                            <div>
                                                                                <p className="text-xs text-gray-500 mb-1">Дуусах цаг</p>
                                                                                <select
                                                                                    value={form.endTime}
                                                                                    disabled={!form.time}
                                                                                    onChange={e => {
                                                                                        const et = e.target.value;
                                                                                        const dur = calcDuration(form.time, et);
                                                                                        setForm({ ...form, endTime: et, duration: dur.toString() });
                                                                                    }}
                                                                                    className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                                                >
                                                                                    <option value="">-- : --</option>
                                                                                    {HALF_HOURLY_TIMES.filter(t => {
                                                                                        if (!form.time) return false;
                                                                                        const [sh, sm] = form.time.split(":").map(Number);
                                                                                        const [th, tm] = t.split(":").map(Number);
                                                                                        const startMins = sh * 60 + sm;
                                                                                        let candidateMins = th * 60 + tm;
                                                                                        if (candidateMins <= startMins) candidateMins += 24 * 60; // Overnight

                                                                                        if (currentPackage && currentPackage.duration) {
                                                                                            const diffMins = candidateMins - startMins;
                                                                                            if (diffMins % 60 !== 0) return false; // зөвхөн бүхэл цагууд
                                                                                            const diffHrs = diffMins / 60;
                                                                                            if (diffHrs < 1 || diffHrs > currentPackage.duration) return false;
                                                                                        }

                                                                                        // Check if any booked slot falls between start and end
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
                                                                        )}
                                                                    </div>
                                                                    {(() => {
                                                                        if (isDroneBattery || !form.time || !currentPackage || !currentPackage.duration) return null;
                                                                        const maxHrs = Number(currentPackage.duration);
                                                                        const [sh, sm] = form.time.split(":").map(Number);
                                                                        const startMins = sh * 60 + sm;
                                                                        let maxAvailable = maxHrs;
                                                                        let hitConflict = false;
                                                                        for (let hrs = 1; hrs <= maxHrs; hrs++) {
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
                                                                        if (maxAvailable > 0 && maxAvailable < maxHrs) {
                                                                            return (
                                                                                <p className="text-xs text-rose-500 mt-2 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                                                                                    ⚠️ Тухайн цагт давхардсан захиалга байгаа тул та хамгийн ихдээ {maxAvailable} цаг сонгох боломжтой байна.
                                                                                </p>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                    {!isDroneBattery && form.time && form.endTime && calcDuration(form.time, form.endTime) > 0 && (
                                                                        <p className="text-xs text-gray-500 mt-1.5">Нийт хугацаа: <span className="text-white font-medium">{calcDuration(form.time, form.endTime)} цаг</span></p>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        {!isDroneBattery && (
                                                            <p className="text-sm text-gray-400 mb-2 mt-4">Үргэлжлэх хугацаа: <span className="text-white font-medium">{currentPackage?.duration || 1} цаг</span></p>
                                                        )}
                                                        <div className="flex items-center justify-between py-3 border-t border-white/10 mt-6">
                                                            <span className="text-sm text-gray-400 uppercase tracking-wider">Нийт төлөх дүн</span>
                                                            <span className="text-xl font-bold text-rose-600">
                                                                {(() => {
                                                                    if (isDroneBattery) {
                                                                        return `${(150000 * batteryCount).toLocaleString()}₮`;
                                                                    }
                                                                    const thePkg = currentPackage;
                                                                    if (!thePkg) return "0₮";
                                                                    const multiplier = isPersonService ? photographerCount : 1;
                                                                    return `${(Number(thePkg.price || 0) * multiplier).toLocaleString()}₮`;
                                                                })()}
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
                                                                            const maxHrs = Number(currentPackage.duration);
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
                amount={(() => {
                    if (isDroneBattery) {
                        return 150000 * batteryCount;
                    }
                    const thePkg = currentPackage;
                    if (!thePkg) return undefined;
                    if (isPersonService) {
                        if (form.time && form.endTime) {
                            const durationHrs = calcDuration(form.time, form.endTime);
                            return (Number(thePkg.price) / thePkg.duration) * durationHrs * photographerCount;
                        }
                        return Number(thePkg.price || 0) * photographerCount;
                    }
                    return Number(thePkg.price || 0);
                })()}
            />
        </div>
    );
}
