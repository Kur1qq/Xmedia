"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X, Youtube, Facebook, Play } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface PortfolioItem {
    id: number;
    title: string;
    description?: string;
    images: string[];
    tags?: string[];
    isPublished: boolean;
    liveDate?: string;
    viewCount?: number;
    youtubeUrl?: string;
    facebookUrl?: string;
}

// Convert YouTube/Facebook URL → embed URL
function toEmbedUrl(youtubeUrl?: string, facebookUrl?: string): string | null {
    if (youtubeUrl) {
        const ytMatch = youtubeUrl.match(
            /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    if (facebookUrl) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookUrl)}&autoplay=1`;
    }
    return null;
}

export default function LivePortfolioPage() {
    const router = useRouter();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [active, setActive] = useState<PortfolioItem | null>(null);
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API}/portfolio?serviceType=LIVE`)
            .then(r => r.json())
            .then((data: PortfolioItem[]) =>
                setItems(Array.isArray(data) ? data.filter(i => i.isPublished) : [])
            )
            .catch(() => { });
    }, []);

    const filtered = items.filter(item =>
        !search || item.title.toLowerCase().includes(search.toLowerCase())
    );

    const col1 = filtered.filter((_, i) => i % 2 === 0);
    const col2 = filtered.filter((_, i) => i % 2 === 1);

    const { scrollYProgress } = useScroll({ container: containerRef });
    const yLeft = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
    const yRight = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

    const embedUrl = active ? toEmbedUrl(active.youtubeUrl, active.facebookUrl) : null;

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
                                autoFocus type="text" value={search}
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

            {/* Grid */}
            <div className="flex gap-1 p-1 pt-0">
                <motion.div style={{ y: yLeft }} className="flex-1 flex flex-col gap-1 will-change-transform">
                    {col1.map((item, i) => (
                        <LiveCard key={item.id} item={item} index={i} onClick={() => setActive(item)} />
                    ))}
                </motion.div>
                <motion.div style={{ y: yRight }} className="flex-1 flex flex-col gap-1 will-change-transform">
                    {col2.map((item, i) => (
                        <LiveCard key={item.id} item={item} index={i} onClick={() => setActive(item)} />
                    ))}
                </motion.div>
            </div>

            {/* Video modal */}
            <AnimatePresence>
                {active && (
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10"
                        onClick={() => setActive(null)}
                    >
                        <button
                            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                            onClick={() => setActive(null)}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.94, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.94, opacity: 0 }}
                            className="w-full max-w-4xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Video embed */}
                            {embedUrl ? (
                                <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: "16/9" }}>
                                    <iframe
                                        src={embedUrl}
                                        className="absolute inset-0 w-full h-full"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        title={active.title}
                                    />
                                </div>
                            ) : (
                                // No video link — show large image
                                <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-900" style={{ aspectRatio: "16/9" }}>
                                    {active.images[0]
                                        ? <img src={active.images[0]} alt={active.title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">Линк байхгүй</div>
                                    }
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                                            <Play className="w-7 h-7 fill-white stroke-none ml-1" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Info */}
                            <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-xl font-bold">{active.title}</h2>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        {active.liveDate && (
                                            <span className="text-white/40 text-xs">
                                                {new Date(active.liveDate).toLocaleDateString("mn-MN")}
                                            </span>
                                        )}
                                        {(active.viewCount ?? 0) > 0 && (
                                            <span className="text-white/40 text-xs">{active.viewCount?.toLocaleString()} үзэлт</span>
                                        )}
                                        {active.description && (
                                            <span className="text-white/40 text-xs">{active.description}</span>
                                        )}
                                    </div>
                                </div>
                                {/* Platform links */}
                                <div className="flex gap-2 shrink-0">
                                    {active.youtubeUrl && (
                                        <a href={active.youtubeUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/90/10 border border-rose-600/90/30 text-rose-600 text-xs hover:bg-rose-600/90/20 transition-colors">
                                            <Youtube className="w-3.5 h-3.5" /> YouTube
                                        </a>
                                    )}
                                    {active.facebookUrl && (
                                        <a href={active.facebookUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-400 text-xs hover:bg-blue-600/20 transition-colors">
                                            <Facebook className="w-3.5 h-3.5" /> Facebook
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function LiveCard({ item, index, onClick }: { item: PortfolioItem; index: number; onClick: () => void }) {
    const img = Array.isArray(item.images) ? item.images[0] : null;
    const hasVideo = !!(item.youtubeUrl || item.facebookUrl);

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
                    <Play className="w-12 h-12 text-white/20" />
                </div>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Play button center */}
            {hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Play className="w-6 h-6 fill-white stroke-none ml-0.5" />
                    </div>
                </div>
            )}

            {/* Platform badge */}
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.youtubeUrl && <div className="w-7 h-7 rounded-full bg-rose-600/90 flex items-center justify-center"><Youtube className="w-3.5 h-3.5 text-white" /></div>}
                {item.facebookUrl && <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center"><Facebook className="w-3.5 h-3.5 text-white" /></div>}
            </div>

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-semibold text-base leading-snug tracking-wide uppercase">{item.title}</p>
                <div className="flex items-center gap-3 mt-1">
                    {item.liveDate && (
                        <span className="text-white/50 text-xs">
                            {new Date(item.liveDate).toLocaleDateString("mn-MN")}
                        </span>
                    )}
                    {(item.viewCount ?? 0) > 0 && (
                        <span className="text-white/50 text-xs">{item.viewCount?.toLocaleString()} үзэлт</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
