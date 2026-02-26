"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Calendar, Users, X } from "lucide-react";
import { useState } from "react";

const streams = [
    {
        id: 1,
        title: "Tech Summit 2025: Future of AI",
        client: "TechMongolia",
        date: "2024.10.15",
        viewers: "15k+ watched",
        image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2670&auto=format&fit=crop",
        videoUrl: "https://www.youtube.com/embed/LXb3EKWsInQ" // Placeholder
    },
    {
        id: 2,
        title: "CS2 Championship Grand Finals",
        client: "MESA",
        date: "2024.11.20",
        viewers: "50k+ watched",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop",
        videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4" // Placeholder
    },
    {
        id: 3,
        title: "Morning Talk Show: Special Episode",
        client: "Xmedia Live",
        date: "2024.12.05",
        viewers: "8k+ watched",
        image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop",
        videoUrl: "https://www.youtube.com/embed/Bey4XXJAqS8" // Placeholder
    }
];

export function LivestreamSection() {
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    return (
        <>
            <section className="w-full py-24 bg-black border-t border-white/5 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white font-sans">
                            Live <span className="text-primary">Streaming</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Бидний зохион байгуулсан томоохон эвент, хурал, тоглолт болон нэвтрүүлгүүдийн архивыг үзэх.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {streams.map((stream, index) => (
                            <motion.div
                                key={stream.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group cursor-pointer"
                                onClick={() => setActiveVideo(stream.videoUrl)}
                            >
                                {/* Thumbnail Container */}
                                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 border border-white/10">
                                    <img
                                        src={stream.image}
                                        alt={stream.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center scale-90 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                            <Play className="w-5 h-5 fill-current ml-1" />
                                        </div>
                                    </div>

                                    {/* Live Badge (Recorded) */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase rounded flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                            Replay
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {stream.date}</span>
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stream.viewers}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight mb-1">
                                        {stream.title}
                                    </h3>
                                    <p className="text-sm text-gray-400">{stream.client}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Modal */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setActiveVideo(null)}
                    >
                        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <button
                                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                onClick={() => setActiveVideo(null)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <iframe
                                src={`${activeVideo}?autoplay=1`}
                                title="Livestream Replay"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
