"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic2, MonitorPlay, X, Check, Users, Square, Info, ArrowLeft, Calendar as CalendarIcon, Phone, User, Loader2, Sparkles, Star, Shield, ArrowRight, HelpCircle, ChevronDown, ChevronUp, GalleryVerticalEnd, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cart";

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
    images: string[] | string | null;  // JSON array or string
    sizeSqm?: number;
    capacity?: number;
    amenities?: string[];
    equipment: { equipment: { name: string } }[];
    packages: StudioPackage[];
}

const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

export default function StudiosPage() {
    const [studios, setStudios] = useState<Studio[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Studio | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<StudioPackage | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ date: undefined as Date | undefined, time: "" });
    const [faqOpen, setFaqOpen] = useState<number | null>(0); // Default open first FAQ
    const { addItem } = useCartStore();

    useEffect(() => {
        fetch(`${API}/studio`)
            .then(r => r.json())
            .then(data => setStudios(Array.isArray(data) ? data : data.data ?? data.items ?? []))
            .catch(() => toast.error("Студиудын мэдээлэл татахад алдаа гарлаа."))
            .finally(() => setLoading(false));
    }, []);

    const minPrice = (s: Studio) => {
        if (!s.packages || s.packages.length === 0) return 0;
        return Math.min(...s.packages.map(p => Number(p.price)));
    };

    const getImage = (s: Studio): string => {
        if (!s.images) return "";
        if (Array.isArray(s.images) && s.images.length > 0) return s.images[0];
        if (typeof s.images === "string") {
            try { const p = JSON.parse(s.images); return Array.isArray(p) ? p[0] ?? "" : ""; } catch { return s.images; }
        }
        return "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.time) { toast.error("Цагаа сонгоно уу."); return; }
        if (!form.date) { toast.error("Огноогоо сонгоно уу."); return; }
        if (!selectedPackage) { toast.error("Багц сонгоно уу."); return; }

        addItem({
            serviceType: "STUDIO",
            serviceId: selected!.id,
            serviceName: selected!.name,
            date: format(form.date, "yyyy-MM-dd"),
            time: form.time,
            duration: selectedPackage.hours,
            unitPrice: Number(selectedPackage.price) / selectedPackage.hours, // Calculate hourly rate
        });

        toast.success("Сагсанд нэмэгдлээ!", { description: "Та сагс руугаа орж төлбөрөө төлнө үү.", duration: 4000 });
        setSelected(null); setIsBooking(false); setSelectedPackage(null);
        setForm({ date: undefined, time: "" });
    };

    const close = () => { setSelected(null); setIsBooking(false); setSelectedPackage(null); setForm({ date: undefined, time: "" }); };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/20 hover:bg-primary/30 blur-[120px] rounded-full pointer-events-none opacity-50 transition-opacity duration-700" />

            <div className="pt-40 md:pt-48 pb-24 relative z-10">
                <div className="container mx-auto px-4 lg:px-8">
                    {/* Header — same as other pages */}
                    <div className="mb-18 flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-4">Мэргэжлийн <span className="text-primary">Студио</span></h1>
                            <p className="text-gray-400 text-lg">Олон улсын стандартын шаардлага хангасан, бүрэн тоноглогдсон тухтай орчинд уран бүтээлээ туурвих боломж.</p>
                        </div>
                        <Link href="/portfolio/studio">
                            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2">
                                <GalleryVerticalEnd className="w-4 h-4 text-primary" />
                                Өмнөх ажлууд харах
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : studios.length === 0 ? (
                        <p className="text-gray-500 text-center py-24">Одоогоор студи нэмэгдээгүй байна.</p>
                    ) : (
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${studios.length < 3 ? 'justify-items-center' : ''}`}>
                            {studios.map((studio, i) => (
                                <motion.div
                                    key={studio.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.08 * i }}
                                    className={`group relative bg-[#0f0f0f] rounded-2xl overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-500 cursor-pointer ${studios.length < 3 ? 'w-full max-w-lg' : 'w-full'} hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:-translate-y-1`}
                                    onClick={() => setSelected(studio)}
                                >
                                    <div className="relative h-60 overflow-hidden">
                                        {getImage(studio) ? (
                                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${getImage(studio)}')` }} />
                                        ) : (
                                            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center"><Camera className="w-12 h-12 text-zinc-700" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent opacity-80" />

                                        {/* Mini Badges inside image */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {studio.sizeSqm && (
                                                <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-white/10 uppercase"><Square className="w-3 h-3 text-primary" /> {Number(studio.sizeSqm)} м.кв</div>
                                            )}
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            {studio.capacity && (
                                                <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-white/10 uppercase"><Users className="w-3 h-3 text-primary" /> {studio.capacity} хүн</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6 pt-4 flex flex-col h-[200px]">
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{studio.name}</h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">{studio.description}</p>
                                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                                            <div className="flex flex-col flex-1">
                                                <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Эхлэх үнэ</span>
                                                <span className="text-white font-extrabold text-lg">{minPrice(studio).toLocaleString()}₮</span>
                                            </div>
                                            <Button size="sm" className="bg-white/5 border border-white/10 text-white hover:bg-primary hover:border-primary group-hover:text-white font-semibold transition-all shadow-none">
                                                Дэлгэрэнгүй <ArrowRight className="w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="border-t border-white/5 bg-[#0a0a0a] py-24 relative z-0">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Яагаад биднийг сонгох вэ?</h2>
                        <p className="text-gray-400">Мэргэжлийн үр дүн, тав тухтай орчин таныг хүлээж байна.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Camera, title: "Топ Тоног Төхөөрөмж", desc: "Сэтгэл ханамжийн баталгаа өгөх хамгийн сүүлийн үеийн камер, гэрэлтүүлэг." },
                            { icon: Users, title: "Тав Тухтай Орчин", desc: "Бүх төрлийн зураг авалт, нэвтрүүлэгт зориулагдсан өргөн зай, дулаан орчин." },
                            { icon: Shield, title: "Найдвартай Үйлчилгээ", desc: "Захиалга бүрт мэргэжлийн туслах, найрсаг харилцааг бид амлаж байна." },
                            { icon: Check, title: "Уян Хатан Хуваарь", desc: "Таны цаг заванд тохирсон өдөр, цагийн сонголтууд." }
                        ].map((feat, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                    <feat.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-24 relative z-0">
                <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-4">Түгээмэл асуултууд</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: "Захиалга баталгаажуулахын тулд төлбөр урьдчилж төлөх шаардлагатай юу?", a: "Тийм ээ, та студийн цагийг баталгаажуулахын тулд урьдчилгаа 50% эсвэл бүрэн төлөх шаардлагатай. Төлбөр орсны дараа таны цаг баталгаажна." },
                            { q: "Студийн багцад туслах ажилтан орох уу?", a: "Үндсэн багцуудад тоног төхөөрөмж, талбай багтсан болно. Хэрвээ танд гэрэлтүүлэг болон камер дээр туслах шаардлагатай бол нэмэлтээр хүн авах боломжтой." },
                            { q: "Цагаа өөрчлөх эсвэл цуцлах боломжтой юу?", a: "Захиалгаа 24 цагийн өмнө өөрчлөх буюу цуцлах боломжтой. Үүнээс хойш бол урьдчилгаа буцаагдахгүйг анхаарна уу." },
                            { q: "Нэмэлт цаг сунгах боломж бий юу?", a: "Хэрэв таны дараагийн цагт өөр хүн захиалга өгөөгүй бол сунгах боломжтой. Сунгасан цагийн төлбөрийг хагас эсвэл бүтэн цагаар тооцно." }
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-[#111] border border-white/5 rounded-xl overflow-hidden transition-all duration-300">
                                <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-white/5 transition-colors">
                                    <span>{faq.q}</span>
                                    {faqOpen === idx ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                <AnimatePresence>
                                    {faqOpen === idx && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Banner */}
            <div className="py-20 relative z-0">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="bg-gradient-to-r from-red-900/40 via-black to-red-900/40 border border-primary/20 rounded-3xl p-10 md:p-16 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Танд өөр тусгай шаардлага байгаа юу?</h2>
                        <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">Том хэмжээний зураг авалт, тусгай төсөл эсвэл олон хоногоор студи ашиглах шаардлагатай бол бидэнтэй шууд холбогдож үнийн санал авна уу.</p>
                        <Button size="lg" className="bg-primary hover:bg-red-600 text-white font-bold h-14 px-8 text-lg w-full sm:w-auto shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-105 active:scale-95">
                            <Phone className="w-5 h-5 mr-2" /> Бидэнтэй холбогдох
                        </Button>
                    </div>
                </div>
            </div>

            {/* Detail + Booking Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={close}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0a0a0a] w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row relative">
                            <button onClick={close} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"><X className="w-5 h-5" /></button>

                            {/* Image */}
                            <div className={`relative h-64 md:h-auto md:w-1/2 flex-shrink-0 ${isBooking ? 'hidden md:block' : ''}`}>
                                {getImage(selected)
                                    ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${getImage(selected)}')` }} />
                                    : <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center"><Camera className="w-16 h-16 text-zinc-600" /></div>
                                }
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111]" />
                            </div>

                            {/* Right panel */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {!isBooking ? (
                                        <motion.div key="detail" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="p-5 md:p-8 flex flex-col h-full">
                                            <div className="flex flex-wrap gap-4 items-center justify-between mb-3">
                                                <div className="flex w-fit items-center gap-2 px-2.5 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase">
                                                    Photography
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    {selected.sizeSqm && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Square className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-sm text-gray-300">{Number(selected.sizeSqm)}m²</span>
                                                        </div>
                                                    )}
                                                    {selected.capacity && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-sm text-gray-300">{selected.capacity}-{Number(selected.capacity) + 5} хүн</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{selected.name}</h2>
                                            <p className="text-gray-400 mb-5 leading-relaxed text-xs md:text-sm">{selected.description}</p>

                                            {(selected.amenities && selected.amenities.length > 0) && (
                                                <div className="mb-5 w-full">
                                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                        <Info className="w-3.5 h-3.5 text-red-500" />Онцлог талууд
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {selected.amenities.map((amenity, i) => (
                                                            <div key={i} className="flex items-center gap-2.5 text-xs text-gray-200 bg-[#141414] px-3 py-2 rounded-lg border border-white/5 truncate">
                                                                <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                                <span className="truncate">{amenity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selected.equipment?.length > 0 && (
                                                <div className="mb-5 w-full">
                                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                                        <Info className="w-3.5 h-3.5 text-red-500" />Тоног төхөөрөмж
                                                    </h4>
                                                    <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                                                        <ul className="space-y-2">
                                                            {selected.equipment.map((eq, i) => (
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
                                                        Үнийн багцууд
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
                                                                    <p className="text-lg font-bold pr-6 text-center text-white mb-2">{pkg.hours} цаг</p>
                                                                    <p className="text-gray-400 font-bold mt-1 text-sm text-center">₮{Number(pkg.price).toLocaleString()}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-auto pt-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                                                <div className="flex flex-col items-start md:items-center">
                                                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">Нийт үнэ</p>
                                                    <p className="text-2xl font-bold">
                                                        {selectedPackage ? `${Number(selectedPackage.price).toLocaleString()}₮` : 'Багц сонгоно уу'}
                                                    </p>
                                                </div>
                                                <Button onClick={() => setIsBooking(true)} disabled={selected.packages?.length > 0 && !selectedPackage} className="w-full md:w-auto px-6 h-12 bg-primary hover:bg-red-600 font-semibold rounded-lg transition-all">Захиалга өгөх</Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="booking" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="p-5 md:p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Button variant="ghost" size="icon" onClick={() => setIsBooking(false)} className="text-gray-400 hover:text-white hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></Button>
                                                <h2 className="text-xl font-bold text-white">Захиалга өгөх — <span className="text-primary">{selected.name}</span></h2>
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
                                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                        {TIMES.map(t => (
                                                            <button key={t} type="button" onClick={() => setForm({ ...form, time: t })}
                                                                className={`py-2 text-xs rounded-lg border transition-all ${form.time === t ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"}`}>{t}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-white/10 flex items-center justify-between mb-2">
                                                    <span className="text-gray-400 text-sm">Нийт үнэ:</span>
                                                    <span className="text-xl font-bold text-primary">{selectedPackage ? Number(selectedPackage.price).toLocaleString() : 0}₮</span>
                                                </div>
                                                <Button type="submit" disabled={submitting} className="w-full h-11 bg-primary hover:bg-red-600 text-white font-semibold">
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
