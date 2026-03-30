"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X, Camera } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface PortfolioItem {
    id: number;
    title: string;
    description?: string;
    images: string[];
    tags?: string[];
    isPublished: boolean;
}

export default function BundlePortfolioPage() {
    const router = useRouter();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API}/portfolio?serviceType=BUNDLE_SERVICE`)
            .then(r => r.json())
            .then((data: PortfolioItem[]) =>
                setItems(Array.isArray(data) ? data.filter(i => i.isPublished) : [])
            )
            .catch(() => { });
    }, []);

    const filtered = items.filter(item =>
        !search || item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    const col1 = filtered.filter((_, i) => i % 2 === 0);
    const col2 = filtered.filter((_, i) => i % 2 === 1);

    const { scrollYProgress } = useScroll({ container: containerRef });
    const yLeft = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
    const yRight = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

    return (
        <div ref={containerRef} className="h-screen overflow-y-scroll bg-black text-white">
            {/* Top bar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 pointer-events-none">
                <button
                    onClick={() => router.back()}
                    className="pointer-events-auto flex items-center justify-center w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 pointer-events-auto">
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.input
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 200, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                autoFocus
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Хайх..."
                                className="bg-black/60 backdrop-blur border border-white/10 rounded-full px-4 py-2 text-sm outline-none text-white placeholder-white/30"
                            />
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => { setSearchOpen(v => !v); setSearch(""); }}
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Two-column parallax grid */}
            <div className="flex gap-1 p-1 pt-0">
                <motion.div
                    style={{ y: yLeft }}
                    className="flex-1 flex flex-col gap-1 will-change-transform"
                >
                    {col1.map((item, i) => (
                        <GridCard key={item.id} item={item} index={i} onClick={() => setLightbox(item)} />
                    ))}
                </motion.div>

                <motion.div
                    style={{ y: yRight }}
                    className="flex-1 flex flex-col gap-1 will-change-transform"
                >
                    {col2.map((item, i) => (
                        <GridCard key={item.id} item={item} index={i} onClick={() => setLightbox(item)} />
                    ))}
                </motion.div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        key="lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-8"
                        onClick={() => setLightbox(null)}
                    >
                        <button
                            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            onClick={() => setLightbox(null)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.94 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.94 }}
                            className="relative max-w-4xl w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            {lightbox.images && lightbox.images.length > 0 && (
                                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 w-full">
                                    {lightbox.images.map((img, idx) => (
                                        <div key={idx} className="shrink-0 w-full snap-center relative">
                                            <img src={img} alt={`${lightbox.title} ${idx + 1}`}
                                                className="w-full rounded-xl object-cover max-h-[80vh]" />
                                            {lightbox.images.length > 1 && (
                                                <div className="absolute top-4 right-6 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-xs font-medium text-white/90">
                                                    {idx + 1} / {lightbox.images.length}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4">
                                <h2 className="text-2xl font-bold">{lightbox.title}</h2>
                                {lightbox.description && <p className="text-white/50 mt-1 text-sm">{lightbox.description}</p>}
                                {(lightbox.tags ?? []).length > 0 && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {(lightbox.tags ?? []).map((t, j) => (
                                            <span key={j} className="px-2.5 py-0.5 rounded-full border border-white/10 text-xs text-white/50">{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function GridCard({ item, index, onClick }: { item: PortfolioItem; index: number; onClick: () => void }) {
    const img = Array.isArray(item.images) ? item.images[0] : null;
    const tags = Array.isArray(item.tags) ? item.tags : [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={onClick}
            className="relative w-full overflow-hidden cursor-pointer group"
            style={{ height: "40vh" }}
        >
            {img ? (
                <img src={img} alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white/10" />
                </div>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-semibold text-base leading-snug tracking-wide uppercase">{item.title}</p>
                {tags.length > 0 && (
                    <p className="text-white/50 text-xs mt-1 tracking-widest uppercase">{tags.join(" / ")}</p>
                )}
            </div>
        </motion.div>
    );
}
