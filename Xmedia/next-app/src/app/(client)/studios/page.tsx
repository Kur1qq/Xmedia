"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic2, MonitorPlay, ArrowRight, X, Check, Users, Square, Info, ArrowLeft, Calendar as CalendarIcon, Clock, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface Studio {
    id: number;
    title: string;
    category: string;
    description: string;
    image: string;
    icon: React.ReactNode;
    area: string;
    capacity: string;
    price: string;
    hourlyPrice: string;
    dailyPrice: string;
    features: string[];
    equipment: string[];
}

const studios: Studio[] = [
    {
        id: 1,
        title: "Гэрэл зургийн студио",
        category: "Photography",
        description: "Мэргэжлийн гэрэлтүүлэг, арын дэвсгэр, тоног төхөөрөмжтэй, тав тухтай орчин.",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop",
        icon: <Camera className="w-6 h-6" />,
        area: "150m²",
        capacity: "10-15 хүн",
        price: "150,000₮ / цаг",
        hourlyPrice: "150,000₮",
        dailyPrice: "150,000₮",
        features: ["Өндөр тааз (4м)", "Хувцас солих өрөө", "Нүүр будалтын хэсэг", "Амралтын хэсэг", "Wi-Fi"],
        equipment: ["Profoto D2 1000 AirTTL", "Softboxes & Umbrellas", "C-Stands", "V-Flats", "Color Gels"]
    },
    {
        id: 2,
        title: "Дуу бичлэгийн студио",
        category: "Audio",
        description: "Дууны дуугүй танхим, мэргэжлийн микрофон, хөгжмийн зэмсэг, эффект системтэй.",
        image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=2070&auto=format&fit=crop",
        icon: <Mic2 className="w-6 h-6" />,
        area: "80m²",
        capacity: "5-8 хүн",
        price: "120,000₮ / цаг",
        hourlyPrice: "120,000₮",
        dailyPrice: "120,000₮",
        features: ["Бүрэн тусгаарлагдсан", "Vocal Booth", "Control Room", "Lounge Area", "Тусгай агааржуулалт"],
        equipment: ["Neumann U87 Ai", "Apollo x8p Interface", "Genelec Monitors", "Pro Tools HD", "Yamaha C7 Grand Piano"]
    },
    {
        id: 3,
        title: "Видео продакшн студио",
        category: "Video",
        description: "Green screen, HD камер, үзэсгэлэнт гэрэлтүүлэг, эфирийн тоног төхөөрөмж.",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop",
        icon: <MonitorPlay className="w-6 h-6" />,
        area: "200m²",
        capacity: "20+ хүн",
        price: "250,000₮ / цаг",
        hourlyPrice: "250,000₮",
        dailyPrice: "250,000₮",
        features: ["3 талт Green Screen", "Тайзны гэрэлтүүлэг", "Шууд эфирийн найруулагчийн хэсэг", "Make-up Room", "Ачаа оруулах хаалга"],
        equipment: ["RED Komodo 6K", "Blackmagic URSA Mini", "Aputure 600d Pro", "ARRI SkyPanels", "Dana Dolly"]
    }
];

export default function StudiosPage() {
    const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
    const [isBooking, setIsBooking] = useState(false);

    // Booking Form State
    const [bookingData, setBookingData] = useState<{
        name: string;
        phone: string;
        date: Date | undefined;
        time: string;
        duration: string;
    }>({
        name: "",
        phone: "",
        date: undefined,
        time: "",
        duration: "1"
    });

    const handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send data to backend
        const formattedDate = bookingData.date ? format(bookingData.date, "yyyy-MM-dd") : "";

        toast.success("Захиалга амжилттай илгээгдлээ!", {
            description: `${formattedDate}-ний өдөр ${bookingData.time} цагт ${selectedStudio?.title}-д захиалга бүртгэгдлээ. Бид тантай удахгүй холбогдох болно.`,
            duration: 5000,
        });
        setIsBooking(false);
        setSelectedStudio(null);
        setBookingData({ name: "", phone: "", date: undefined, time: "", duration: "1" });
    };

    const closeHandler = () => {
        setSelectedStudio(null);
        setIsBooking(false);
    };

    return (
        <div className="pt-20 min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white font-sans">
                            Манай <span className="text-primary">Студиуд</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Таны уран бүтээлийг амилуулах мэргэжлийн студи, тоног төхөөрөмжүүд.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {studios.map((studio, index) => (
                        <motion.div
                            key={studio.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * (index + 1) }}
                            className="group relative bg-[#1a1a1a] rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer"
                            onClick={() => setSelectedStudio(studio)}
                        >
                            <div className="relative h-64 overflow-hidden">
                                <div className="absolute top-4 right-4 z-10 bg-primary p-2.5 rounded-full text-white shadow-lg">
                                    {studio.icon}
                                </div>
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url('${studio.image}')` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-80" />
                            </div>

                            <div className="p-6 pt-2">
                                <h3 className="text-2xl font-bold text-white mb-2">{studio.title}</h3>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                    {studio.description}
                                </p>

                                <div className="flex justify-between items-center text-sm text-gray-500 mb-6 border-t border-white/10 pt-4">
                                    <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {studio.area}</span>
                                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {studio.capacity}</span>
                                </div>

                                <Button className="w-full h-14 rounded-none bg-white/5 border border-white/30 backdrop-blur-sm text-white font-semibold flex items-center justify-center gap-2 group-hover:border-red-500/50 group-hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] transition-all duration-300 relative overflow-hidden">
                                    <span className="relative z-10">Дэлгэрэнгүй</span>
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Studio Details Modal */}
            <AnimatePresence>
                {selectedStudio && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                        onClick={closeHandler}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#111] w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative flex flex-col md:flex-row"
                        >
                            <button
                                onClick={closeHandler}
                                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Left Side: Image (Always visible) */}
                            <div className={`relative h-48 md:h-auto md:w-1/2 lg:w-5/12 transition-all duration-500 ${isBooking ? 'hidden md:block' : 'block'}`}>
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${selectedStudio.image}')` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] md:bg-gradient-to-r md:from-transparent md:to-[#111]" />

                                <div className="absolute bottom-6 left-6 right-6 md:hidden">
                                    <h3 className="text-2xl font-bold text-white mb-1">{selectedStudio.title}</h3>
                                    <p className="text-primary font-bold">{selectedStudio.hourlyPrice}</p>
                                </div>
                            </div>

                            {/* Right Side: Content Area (Switchable) */}
                            <div className="flex-1 bg-[#111] overflow-y-auto max-h-[calc(90vh-12rem)] md:max-h-[90vh] relative flex flex-col">
                                <AnimatePresence mode="wait">
                                    {!isBooking ? (
                                        // DETAILS VIEW
                                        <motion.div
                                            key="details"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-6 md:p-12 flex flex-col h-full"
                                        >
                                            <div className="hidden md:block mb-8">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                                                        {selectedStudio.category}
                                                    </span>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1.5"><Square className="w-4 h-4" /> {selectedStudio.area}</span>
                                                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedStudio.capacity}</span>
                                                    </div>
                                                </div>
                                                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{selectedStudio.title}</h2>
                                                <p className="text-gray-400 leading-relaxed text-lg">
                                                    {selectedStudio.description}
                                                </p>
                                            </div>

                                            <div className="md:hidden mb-6">
                                                <p className="text-gray-300 leading-relaxed">
                                                    {selectedStudio.description}
                                                </p>
                                            </div>

                                            <div className="space-y-8 flex-1">
                                                {/* Features Grid */}
                                                <div>
                                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                                        <Info className="w-4 h-4 text-primary" /> Онцлог талууд
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {selectedStudio.features.map((feature, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">
                                                                <Check className="w-4 h-4 text-primary shrink-0" />
                                                                <span>{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Equipment List */}
                                                <div>
                                                    <h4 className="text-white font-bold mb-4">Тоног төхөөрөмж</h4>
                                                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                                                        <ul className="space-y-2">
                                                            {selectedStudio.equipment.map((item, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0" />
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Action */}
                                            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex gap-8 w-full sm:w-auto justify-between sm:justify-start">
                                                    <div>
                                                        <p className="text-gray-400 text-xs uppercase tracking-wider">Цагийн үнэ</p>
                                                        <p className="text-xl lg:text-2xl font-bold text-white">{selectedStudio.hourlyPrice}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 text-xs uppercase tracking-wider">Өдрийн үнэ</p>
                                                        <p className="text-xl lg:text-2xl font-bold text-white">{selectedStudio.dailyPrice}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full sm:w-auto font-semibold text-lg px-4 h-12 bg-white/5 border border-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] hover:border-red-500/50 hover:scale-105"
                                                    onClick={() => setIsBooking(true)}
                                                >
                                                    Захиалга өгөх
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        // BOOKING FORM VIEW
                                        <motion.div
                                            key="booking"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-6 md:p-12 flex flex-col h-full"
                                        >
                                            <div className="flex items-center gap-4 mb-8">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setIsBooking(false)}
                                                    className="text-gray-400 hover:text-white hover:bg-white/10"
                                                >
                                                    <ArrowLeft className="w-6 h-6" />
                                                </Button>
                                                <h2 className="text-2xl md:text-3xl font-bold text-white">Захиалга өгөх</h2>
                                            </div>

                                            <form onSubmit={handleBookingSubmit} className="space-y-6 flex-1">
                                                <div className="space-y-4">
                                                    <div className="grid gap-2">
                                                        <span className="text-sm font-medium text-gray-300">Таны нэр</span>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                            <Input
                                                                required
                                                                className="pl-10 bg-white/5 border-white/10 text-white focus-visible:ring-primary"
                                                                placeholder="Нэрээ оруулна уу"
                                                                value={bookingData.name}
                                                                onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <span className="text-sm font-medium text-gray-300">Утасны дугаар</span>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                            <Input
                                                                required
                                                                type="tel"
                                                                className="pl-10 bg-white/5 border-white/10 text-white focus-visible:ring-primary"
                                                                placeholder="Утасны дугаар"
                                                                value={bookingData.phone}
                                                                onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <span className="text-sm font-medium text-gray-300">Огноо</span>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-10 justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                                                                        !bookingData.date && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                                    {bookingData.date ? format(bookingData.date, "yyyy-MM-dd") : <span>Огноо сонгох</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 bg-[#111] border-white/10 z-[200]" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={bookingData.date}
                                                                    onSelect={(date) => setBookingData({ ...bookingData, date })}
                                                                    initialFocus
                                                                    className="bg-[#111] text-white"
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <span className="text-sm font-medium text-gray-300">Сул цагууд</span>
                                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                            {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map((time) => (
                                                                <button
                                                                    key={time}
                                                                    type="button"
                                                                    onClick={() => setBookingData({ ...bookingData, time })}
                                                                    className={`px-2 py-2 text-sm rounded-md border transition-all duration-200 ${bookingData.time === time
                                                                        ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(255,0,0,0.4)] scale-105"
                                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white"
                                                                        }`}
                                                                >
                                                                    {time}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {!bookingData.time && <p className="text-xs text-red-500/80">* Цагаа сонгоно уу</p>}
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <span className="text-sm font-medium text-gray-300">Үргэлжлэх хугацаа (цагаар)</span>
                                                        <Input
                                                            required
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            className="bg-white/5 border-white/10 text-white focus-visible:ring-primary"
                                                            value={bookingData.duration}
                                                            onChange={(e) => setBookingData({ ...bookingData, duration: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-white/10">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <span className="text-gray-400">Нийт төлбөр (тооцоолсон):</span>
                                                        <span className="text-2xl font-bold text-primary">
                                                            {(parseInt(selectedStudio.hourlyPrice.replace(/\D/g, '')) * parseInt(bookingData.duration || "0")).toLocaleString()}₮
                                                        </span>
                                                    </div>
                                                    <Button type="submit" className="w-full font-semibold text-lg h-12 bg-primary hover:bg-red-600 text-white shadow-lg shadow-red-900/20">
                                                        Баталгаажуулах
                                                    </Button>
                                                </div>
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
