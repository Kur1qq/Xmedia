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

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

interface PhotographerServicePackage {
    id: number;
    subTypeId: number;
    price: number;
    priceLabel?: string;
    subType?: { name: string };
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
    const [services, setServices] = useState<PhotographerService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<PhotographerService | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<PhotographerServicePackage | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ date: undefined as Date | undefined, time: "", duration: "1" });
    const { addItem } = useCartStore();

    useEffect(() => {
        fetch(`${API}/photographer-services`)
            .then(r => r.json())
            .then(data => setServices(Array.isArray(data) ? data : data.data ?? data.items ?? []))
            .catch(() => toast.error("Мэдээлэл татахад алдаа гарлаа."))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.time) { toast.error("Цагаа сонгоно уу."); return; }
        if (!form.date) { toast.error("Огноогоо сонгоно уу."); return; }

        addItem({
            serviceType: "PHOTOGRAPHER_SERVICE",
            serviceId: selected!.id,
            serviceName: selected!.name,
            date: format(form.date, "yyyy-MM-dd"),
            time: form.time,
            duration: parseInt(form.duration),
            unitPrice: Number(selectedPackage?.price || 0),
        });

        toast.success("Сагсанд нэмэгдлээ!", { description: "Та сагс руугаа орж төлбөрөө төлнө үү.", duration: 4000 });
        setSelected(null); setIsBooking(false);
        setForm({ date: undefined, time: "", duration: "1" });
    };

    const close = () => { setSelected(null); setSelectedPackage(null); setIsBooking(false); setForm({ date: undefined, time: "", duration: "1" }); };

    return (
        <div className="pt-40 md:pt-48 pb-24 min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="mb-18 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-4">Гэрэл <span className="text-primary">Зурагчин</span></h1>
                        <p className="text-gray-400 text-lg">Мэргэжлийн гэрэл зурагчны үйлчилгээ — арга хэмжээ, портрет, бизнес.</p>
                    </div>
                    <Link href="/portfolio/photographer">
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
                                onClick={() => { setSelected(svc); setSelectedPackage(svc.packages?.[0] || null); }}>
                                <div className="relative h-52 overflow-hidden">
                                    {svc.image
                                        ? <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${svc.image}')` }} />
                                        : <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center"><ImageIcon className="w-12 h-12 text-zinc-600" /></div>
                                    }
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
                                </div>
                                <div className="p-6 pt-3">
                                    <h3 className="text-xl font-bold mb-2">{svc.name}</h3>
                                    <p className="text-gray-400 text-sm mb-5 line-clamp-2">{svc.description}</p>
                                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-[10px] uppercase tracking-wider">Үнэ</span>
                                            <span className="text-white font-bold text-lg">
                                                {svc.packages && svc.packages.length > 0
                                                    ? `${Math.min(...svc.packages.map(p => p.price)).toLocaleString()}₮ -с`
                                                    : 'Үнэгүй'}
                                            </span>
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
                                    : <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center"><ImageIcon className="w-16 h-16 text-zinc-600" /></div>
                                }
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111]" />
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    {!isBooking ? (
                                        <motion.div key="detail" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="p-6 md:p-10 flex flex-col h-full">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {selected.mainType && <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] md:text-xs font-medium text-primary uppercase tracking-wider">{selected.mainType.name}</span>}
                                            </div>

                                            <h2 className="text-2xl md:text-3xl font-bold mb-3">{selected.name}</h2>
                                            <p className="text-gray-400 mb-6 leading-relaxed text-sm">{selected.description}</p>

                                            {(selected.amenities && selected.amenities.length > 0) && (
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

                                            {selected.equipments && selected.equipments.length > 0 && (
                                                <div className="mb-6 w-full">
                                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                        <Info className="w-4 h-4 text-primary" /> Тоног төхөөрөмж
                                                    </h4>
                                                    <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {selected.equipments.map((eq, i) => (
                                                                <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0 mt-[5px]" />
                                                                    <span className="flex-1 leading-snug">{eq.equipment?.name}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {selected.packages && selected.packages.length > 0 && (
                                                <div className="mb-6 w-full">
                                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                        Контентийн төрөл сонгох
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {selected.packages.map(pkg => (
                                                            <div
                                                                key={pkg.id}
                                                                onClick={() => setSelectedPackage(pkg)}
                                                                className={`cursor-pointer p-4 rounded-xl border relative transition-all ${selectedPackage?.id === pkg.id ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                                            >
                                                                {selectedPackage?.id === pkg.id && <div className="absolute top-4 right-4"><Check className="w-4 h-4 text-primary" /></div>}
                                                                <p className="text-sm font-medium pr-6">{pkg.subType?.name || pkg.priceLabel || "Үндсэн багц"}</p>
                                                                {pkg.priceLabel && pkg.subType && <p className="text-xs text-gray-400 mt-1">{pkg.priceLabel}</p>}
                                                                <p className="text-primary font-bold mt-3 text-lg">{Number(pkg.price).toLocaleString()}₮</p>
                                                            </div>
                                                        ))}
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
                                                <Button onClick={() => setIsBooking(true)} disabled={!selectedPackage} className="px-8 h-11 bg-primary hover:bg-red-600 font-semibold">Захиалга өгөх</Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="booking" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="p-6 md:p-8">
                                            <div className="flex items-center gap-3 mb-5">
                                                <Button variant="ghost" size="icon" onClick={() => setIsBooking(false)} className="text-gray-400 hover:text-white hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></Button>
                                                <h2 className="text-xl font-bold">Захиалга — <span className="text-primary">{selected.name}</span></h2>
                                            </div>
                                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                                    <p className="text-sm text-gray-400 mb-2">Эхлэх цаг</p>
                                                    <div className="grid grid-cols-4 gap-2">{TIMES.map(t => (<button key={t} type="button" onClick={() => setForm({ ...form, time: t })} className={`py-2 text-xs rounded-lg border transition-all ${form.time === t ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>{t}</button>))}</div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-2">Хугацаа (цаг)</p>
                                                    <Input required type="number" min="1" max="24" className="bg-white/5 border-white/10 text-white" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                                                </div>
                                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                                    <span className="text-gray-400 text-sm">Нийт үнэ:</span>
                                                    <span className="text-xl font-bold text-primary">{((Number(selectedPackage?.price || 0)) * parseInt(form.duration || "0")).toLocaleString()}₮</span>
                                                </div>
                                                <Button type="submit" disabled={submitting} className="w-full h-11 bg-primary hover:bg-red-600 font-semibold">
                                                    Сагсанд нэмэх
                                                </Button>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
