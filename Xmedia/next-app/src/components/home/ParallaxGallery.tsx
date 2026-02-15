"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const images = [
    // Column 1
    [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=2850&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2940&auto=format&fit=crop"
    ],
    // Column 2
    [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop"
    ],
    // Column 3
    [
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1887&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1887&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1887&auto=format&fit=crop"
    ],
    // Column 4
    [
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop"
    ]
];

export function ParallaxGallery() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const y4 = useTransform(scrollYProgress, [0, 1], [0, -200]);

    const yTransforms = [y1, y2, y3, y4];

    return (
        <section ref={containerRef} className="w-full py-20 bg-black overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white font-sans">
                        Professional <span className="text-primary">Photography</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Бид таны үнэ цэнэтэй мөчүүдийг гэрэл зургийн хальснаа мөнхлөн үлдээж, өнгө шүүлт (retouching) болон зохиомжийн гайхалтай хослолыг бүтээнэ.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[800px] md:h-[1000px] overflow-hidden rounded-3xl bg-black/50 p-4 border border-white/5">
                    {images.map((col, i) => (
                        <motion.div
                            key={i}
                            style={{ y: yTransforms[i] }}
                            className="flex flex-col gap-4"
                        >
                            {col.map((src, j) => (
                                <div
                                    key={j}
                                    className={`relative w-full rounded-xl overflow-hidden group ${i === 0 && j === 0 ? "aspect-[5/6]" : "aspect-[2/3]"}`}
                                >
                                    <img
                                        src={src}
                                        alt="Gallery"
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                                </div>
                            ))}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
