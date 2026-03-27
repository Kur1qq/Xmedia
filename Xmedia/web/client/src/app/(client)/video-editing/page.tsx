"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Film, ArrowLeft, Loader2, Check, Info, GalleryVerticalEnd, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cart";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";
import { loadCustomerInfo, saveCustomerInfo } from "@/lib/customer";

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
    const { user } = useAuthStore();
    const router = useRouter();
    const [services, setServices] = useState<EditService[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [selectedPackages, setSelectedPackages] = useState<Record<number, ServicePackage>>({});
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ date: undefined as Date | undefined, notes: "", name: "", phone: "", email: "" });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { addItem } = useCartStore();

    useEffect(() => {
        fetch(`${API}/edit-services`)
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
            setForm(prev => ({ ...prev, name: user.name || "", phone: user.phone || "", email: user.email || "" }));
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

    const handlePackageSelect = (serviceId: number, pkg: ServicePackage) => {
        setSelectedPackages(prev => ({ ...prev, [serviceId]: pkg }));
    };

    const handleTabChange = (id: number) => {
        setActiveServiceId(id);
        setIsBooking(false);
        setForm(prev => ({ ...prev, date: undefined, notes: "" }));
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
        if (!form.date) { toast.error("Огноогоо сонгоно уу."); return false; }
        if (activeService?.packages && activeService.packages.length > 0 && !currentPackage) { toast.error("Багц сонгоно уу."); return false; }
        return true;
    };

    const handleAddToCart = () => {
        if (!validateForm() || !activeService) return;

        addItem({
            serviceType: "EDIT_SERVICE",
            serviceId: activeService.id,
            serviceName: activeService.name,
            date: format(form.date!, "yyyy-MM-dd"),
            time: "09:00", // Defaulting to start of day since edit service doesn't mandate specific time slots
            duration: 1, // Quantity of service packages
            unitPrice: Number(currentPackage ? currentPackage.price : 0),
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
            const payload: Record<string, unknown> = {
                name: form.name,
                phone: form.phone,
                email: form.email,
                date: format(form.date!, "yyyy-MM-dd"), time: "09:00",
                duration: 1,
                serviceType: "EDIT_SERVICE", serviceId: activeService.id,
                unitPrice: Number(currentPackage ? currentPackage.price : 0),
                serviceName: activeService.name,
                paymentType,
                notes: form.notes,
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

    const closeBooking = () => { setIsBooking(false); setForm(prev => ({ ...prev, date: undefined, notes: "" })); };

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

                                <div className={`relative h-[250px] lg:h-[450px] max-h-[50vh] lg:w-[45%] flex-shrink-0 rounded-[24px] overflow-hidden ${isBooking ? 'hidden lg:block' : ''}`}>
                                    {activeService.image
                                        ? <motion.div key={activeService.image} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${activeService.image}')` }} />
                                        : <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center"><Film className="w-16 h-16 text-zinc-600" /></div>
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
                                                    <h2 className="text-2xl md:text-3xl font-bold mb-0">{activeService.name}</h2>
                                                    <Link href="/portfolio/edit">
                                                        <div className="flex w-fit items-center gap-2 px-2.5 py-1 bg-rose-600/10 text-white rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase hover:bg-rose-600/20 transition-all cursor-pointer">
                                                            <GalleryVerticalEnd className="w-3 h-3" />
                                                            Өмнөх ажил
                                                        </div>
                                                    </Link>
                                                </div>
                                                <p className="text-gray-400 mb-6 leading-relaxed text-sm md:text-base">{activeService.description}</p>

                                                {activeService.amenities && activeService.amenities.length > 0 && (
                                                    <div className="mb-6 w-full">
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                            <Info className="w-4 h-4 text-rose-600" /> Онцлог талуу
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

                                                {/* Packages selection */}
                                                {activeService.packages && activeService.packages.length > 0 && (
                                                    <div className="mb-4 w-full mt-auto pt-4">
                                                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                                                            Үнийн багцууд
                                                        </h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                            {activeService.packages.map((pkg) => {
                                                                const currentSelectedPkg = selectedPackages[activeService.id] || activeService.packages![0];
                                                                const isSelected = currentSelectedPkg.id === pkg.id;

                                                                return (
                                                                    <div
                                                                        key={pkg.id}
                                                                        onClick={() => handlePackageSelect(activeService.id, pkg)}
                                                                        className={`cursor-pointer p-3 rounded-xl border relative transition-all flex flex-col items-center justify-center ${isSelected ? 'border-rose-600 bg-rose-600/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                                                    >
                                                                        {isSelected && <div className="absolute top-2 right-2"><Check className="w-3 h-3 text-rose-600" /></div>}
                                                                        {(() => {
                                                                            const title = pkg.priceLabel || pkg.subType?.name || "Үндсэн багц";
                                                                            return (
                                                                                <>
                                                                                    <p className="text-sm text-center font-bold text-white mb-1 leading-tight">{title}</p>
                                                                                    <p className="text-gray-400 text-center font-bold mt-1 text-xs">{Number(pkg.price).toLocaleString()}₮</p>
                                                                                </>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                                                    <div className="flex flex-col items-start md:items-center">
                                                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Нийт үнэ</p>
                                                        <p className="text-2xl font-bold">
                                                            {(() => {
                                                                const thePkg = selectedPackages[activeService.id] || (activeService.packages && activeService.packages[0]);
                                                                return thePkg ? `${Number(thePkg.price).toLocaleString()}₮` : 'Сонгоно уу';
                                                            })()}
                                                        </p>
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
                                                                <span>{form.date ? format(form.date, "yyyy-MM-dd") : "Эхлэх огноо сонгох"}</span>
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 bg-[#111] border-white/10 z-[200]" align="start">
                                                            <Calendar mode="single" selected={form.date} onSelect={d => { setForm({ ...form, date: d }); setCalendarOpen(false); }} className="bg-[#111] text-white" />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <div>
                                                        <p className="text-sm text-gray-400 mb-2">Нэмэлт тайлбар (заавал биш)</p>
                                                        <textarea placeholder="Жишээ: 3 минутын хэрчмэл, музыктай, лого нэмэх..." className="w-full h-24 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-500" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                                    </div>

                                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                                                        <span className="text-gray-400 text-sm">Нийт:</span>
                                                        <span className="text-xl font-bold text-rose-600">{((Number(selectedPackages[activeService.id]?.price || 0)) * parseInt("1")).toLocaleString()}₮</span>
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
        </div>

            <PaymentMethodModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSelectQpay={() => { handleBuyNow("qpay"); }}
                onSelectInvoice={() => { handleBuyNow("invoice"); }}
                loading={submitting}
                amount={currentPackage ? Number(currentPackage.price) : undefined}
            />
        </div>
    );
}
