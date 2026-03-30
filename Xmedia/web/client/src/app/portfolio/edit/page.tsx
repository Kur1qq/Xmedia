"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X, ImageIcon, Film, Youtube, Facebook, Play, Instagram, Music } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface PortfolioItem {
    id: number;
    title: string;
    description?: string;
    images: string[];
    tags?: string[];
    isPublished: boolean;
    youtubeUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
}

// Convert URLs → embed URL
function toEmbedUrl(youtubeUrl?: string, facebookUrl?: string, tiktokUrl?: string): string | null {
    if (youtubeUrl) {
        const ytMatch = youtubeUrl.match(
            /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    if (facebookUrl) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookUrl)}&autoplay=1`;
    }
    if (tiktokUrl) {
        const match = tiktokUrl.match(/video\/(\d+)/);
        if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`;
    }
    return null;
}

export default function EditPortfolioPage() {
    const router = useRouter();
    const [photoItems, setPhotoItems] = useState<PortfolioItem[]>([]);
    const [videoItems, setVideoItems] = useState<PortfolioItem[]>([]);
    const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API}/portfolio?serviceType=PHOTO_EDIT`)
            .then(r => r.json())
            .then((data: PortfolioItem[]) =>
                setPhotoItems(Array.isArray(data) ? data.filter(i => i.isPublished) : [])
            )
            .catch(() => { });

        fetch(`${API}/portfolio?serviceType=VIDEO_EDIT`)
            .then(r => r.json())
            .then((data: PortfolioItem[]) =>
                setVideoItems(Array.isArray(data) ? data.filter(i => i.isPublished) : [])
            )
            .catch(() => { });
    }, []);

    const filterItems = (items: PortfolioItem[]) =>
        items.filter(item =>
            !search || item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
        );

    const filteredPhoto = filterItems(photoItems);
    const filteredVideo = filterItems(videoItems);



    const embedUrl = lightbox ? toEmbedUrl(lightbox.youtubeUrl, lightbox.facebookUrl, lightbox.tiktokUrl) : null;
    const isVideoItem = lightbox ? !!(lightbox.youtubeUrl || lightbox.facebookUrl || lightbox.instagramUrl || lightbox.tiktokUrl) : false;

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

            {/* Column labels — sticky below top bar */}
            <div className="sticky top-14 z-40 flex gap-1 px-1 pb-2 bg-gradient-to-b from-black via-black to-transparent">
                <div className="flex-1 flex items-center justify-center gap-2 py-3">
                    <ImageIcon className="w-4 h-4 text-rose-600" />
                    <span className="text-sm font-bold tracking-widest uppercase text-white/70">Зураг эдит</span>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 py-3">
                    <Film className="w-4 h-4 text-rose-600" />
                    <span className="text-sm font-bold tracking-widest uppercase text-white/70">Видео эдит</span>
                </div>
            </div>

            {/* Spacer for sticky labels */}
            <div className="h-2" />

            {/* Two-column grid: Left = Photo Edit, Right = Video Edit */}
            <div className="flex gap-1 px-1 pb-1">
                {/* Left column — Photo Edit */}
                <div
                    className="flex-1 flex flex-col gap-1"
                >
                    {filteredPhoto.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-white/20 text-sm">
                            Зураг эдит ажил байхгүй
                        </div>
                    ) : (
                        filteredPhoto.map((item, i) => (
                            <PhotoCard key={item.id} item={item} index={i} onClick={() => setLightbox(item)} />
                        ))
                    )}
                </div>

                {/* Right column — Video Edit */}
                <div
                    className="flex-1 flex flex-col gap-1"
                >
                    {filteredVideo.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-white/20 text-sm">
                            Видео эдит ажил байхгүй
                        </div>
                    ) : (
                        filteredVideo.map((item, i) => (
                            <VideoCard key={item.id} item={item} index={i} onClick={() => setLightbox(item)} />
                        ))
                    )}
                </div>
            </div>

            {/* Lightbox / Video modal */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        key="lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10"
                        onClick={() => setLightbox(null)}
                    >
                        <button
                            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                            onClick={() => setLightbox(null)}
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
                            {/* Video embed or Image */}
                            {embedUrl ? (
                                <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: "16/9" }}>
                                    <iframe
                                        src={embedUrl}
                                        className="absolute inset-0 w-full h-full"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        title={lightbox.title}
                                    />
                                </div>
                            ) : lightbox.images && lightbox.images.length > 0 ? (
                                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 w-full">
                                    {lightbox.images.map((img, idx) => (
                                        <div key={idx} className="shrink-0 w-full snap-center relative">
                                            <img src={img} alt={`${lightbox.title} ${idx + 1}`}
                                                className="w-full rounded-2xl object-cover max-h-[80vh]" />
                                            {lightbox.images.length > 1 && (
                                                <div className="absolute top-4 right-6 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-xs font-medium text-white/90">
                                                    {idx + 1} / {lightbox.images.length}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full rounded-2xl bg-zinc-900 flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                                    <span className="text-white/20 text-sm">Зураг байхгүй</span>
                                </div>
                            )}

                            {/* Info */}
                            <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-xl font-bold">{lightbox.title}</h2>
                                    {lightbox.description && (
                                        <p className="text-white/40 text-sm mt-1">{lightbox.description}</p>
                                    )}
                                    {(lightbox.tags ?? []).length > 0 && (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {(lightbox.tags ?? []).map((t, j) => (
                                                <span key={j} className="px-2.5 py-0.5 rounded-full border border-white/10 text-xs text-white/50">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Platform links for video items */}
                                {isVideoItem && (
                                    <div className="flex gap-2 shrink-0 flex-wrap">
                                        {lightbox.youtubeUrl && (
                                            <a href={lightbox.youtubeUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/90/10 border border-rose-600/90/30 text-rose-600 text-xs hover:bg-rose-600/90/20 transition-colors">
                                                <Youtube className="w-3.5 h-3.5" /> YouTube
                                            </a>
                                        )}
                                        {lightbox.facebookUrl && (
                                            <a href={lightbox.facebookUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-400 text-xs hover:bg-blue-600/20 transition-colors">
                                                <Facebook className="w-3.5 h-3.5" /> Facebook
                                            </a>
                                        )}
                                        {lightbox.instagramUrl && (
                                            <a href={lightbox.instagramUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-600/10 border border-pink-600/30 text-pink-400 text-xs hover:bg-pink-600/20 transition-colors">
                                                <Instagram className="w-3.5 h-3.5" /> Instagram
                                            </a>
                                        )}
                                        {lightbox.tiktokUrl && (
                                            <a href={lightbox.tiktokUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-600/10 border border-gray-600/30 text-gray-300 text-xs hover:bg-gray-600/20 transition-colors">
                                                <Music className="w-3.5 h-3.5" /> TikTok
                                            </a>
                                        )}
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

/* ─── Photo Edit Card ─── */
function PhotoCard({ item, index, onClick }: { item: PortfolioItem; index: number; onClick: () => void }) {
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
            style={{ aspectRatio: "903/620" }}
        >
            {img ? (
                <img src={img} alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white/10" />
                </div>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Badge */}
            <div className="absolute top-3 left-3">
                <div className="px-2.5 py-1 rounded-full bg-rose-600/20 backdrop-blur-sm border border-rose-600/30 text-[10px] font-bold tracking-wider uppercase text-rose-600">
                    Фото
                </div>
            </div>

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

/* ─── Video Edit Card ─── */
function VideoCard({ item, index, onClick }: { item: PortfolioItem; index: number; onClick: () => void }) {
    const img = Array.isArray(item.images) ? item.images[0] : null;
    const hasVideo = !!(item.youtubeUrl || item.facebookUrl || item.instagramUrl || item.tiktokUrl);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={onClick}
            className="relative w-full overflow-hidden cursor-pointer group"
            style={{ aspectRatio: "903/620" }}
        >
            {img ? (
                <img src={img} alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <Film className="w-12 h-12 text-white/10" />
                </div>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Play button */}
            {hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Play className="w-6 h-6 fill-white stroke-none ml-0.5" />
                    </div>
                </div>
            )}

            {/* Badge */}
            <div className="absolute top-3 left-3">
                <div className="px-2.5 py-1 rounded-full bg-rose-600/20 backdrop-blur-sm border border-rose-600/30 text-[10px] font-bold tracking-wider uppercase text-rose-600">
                    Видео
                </div>
            </div>

            {/* Platform badges */}
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.youtubeUrl && <div className="w-7 h-7 rounded-full bg-rose-600/90 flex items-center justify-center"><Youtube className="w-3.5 h-3.5 text-white" /></div>}
                {item.facebookUrl && <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center"><Facebook className="w-3.5 h-3.5 text-white" /></div>}
                {item.instagramUrl && <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center"><Instagram className="w-3.5 h-3.5 text-white" /></div>}
                {item.tiktokUrl && <div className="w-7 h-7 rounded-full bg-black border border-white/20 flex items-center justify-center"><Music className="w-3.5 h-3.5 text-white" /></div>}
            </div>

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-semibold text-base leading-snug tracking-wide uppercase">{item.title}</p>
                {item.tags && item.tags.length > 0 && (
                    <p className="text-white/50 text-xs mt-1 tracking-widest uppercase">{item.tags.join(" / ")}</p>
                )}
            </div>
        </motion.div>
    );
}
