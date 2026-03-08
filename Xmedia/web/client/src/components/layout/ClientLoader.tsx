"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ClientLoader() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        const duration = 1800; // time it takes to see the complete animation

        const timer = setTimeout(() => {
            setIsVisible(false);
            document.body.style.overflow = "";
        }, duration);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} // Cinematic sweeping exit
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
                >
                    <div className="relative flex flex-col items-center justify-center w-full max-w-sm">

                        {/* Abstract Shutter/Lens Ring Lines */}
                        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                            {/* Outer Spinning Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                                className="absolute inset-0 border border-t-primary border-r-transparent border-b-primary/30 border-l-transparent rounded-full opacity-70"
                            />
                            {/* Inner Counter-Spinning Ring */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                                className="absolute inset-2 border border-t-transparent border-r-white border-b-transparent border-l-white/30 rounded-full opacity-50"
                            />
                            {/* Center Target Dot */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-2 h-2 bg-primary rounded-full"
                            />
                        </div>

                        {/* Modern Typography Reveal */}
                        <div className="overflow-hidden">
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.33, 1, 0.68, 1],
                                    delay: 0.2
                                }}
                                className="text-4xl sm:text-5xl font-sans font-black tracking-[0.2em] text-white uppercase text-center"
                            >
                                XTUDIO
                            </motion.div>
                        </div>

                        <div className="overflow-hidden mt-2">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.33, 1, 0.68, 1],
                                    delay: 0.4
                                }}
                                className="text-xs sm:text-sm font-light tracking-[0.4em] text-white/50 uppercase"
                            >
                                Creative Studio
                            </motion.div>
                        </div>

                        {/* Minimal Loading Line */}
                        <div className="mt-12 w-48 h-[1px] bg-white/10 overflow-hidden relative">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.2,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-0 left-0 w-full h-full bg-primary"
                            />
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
