"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Radio, Image, Film, Package, Mic, MonitorPlay } from "lucide-react";

const IconMap: Record<string, any> = {
  Camera, Radio, Image, Film, Package, Mic, MonitorPlay
};
import SnowEffect from "@/components/SnowEffect";

// Slide Data
interface Slide {
  id: number;
  title: string;
  highlight: string;
  subTitle: string;
  description: string;
  image: string;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [snowEffect, setSnowEffect] = useState(false);
  const [homeCards, setHomeCards] = useState<any[]>([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/hero/active`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setSlides(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch slides", error);
      }
    };
    fetchSlides();
  }, []);

  // Fetch snow effect setting
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings`);
        if (res.ok) {
          const data = await res.json();
          setSnowEffect(!!data.snowEffect);
          if (data.homeCards && data.homeCards.length > 0) {
            setHomeCards(data.homeCards);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
  }, []);

  // Use a separate side-effect to inject a preload link for the first background media
  useEffect(() => {
    if (slides.length > 0 && slides[0]?.image) {
      const firstSlideImage = slides[0].image;
      const isVideo = firstSlideImage.match(/\.(mp4|webm|ogg|mov)$/i);

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = firstSlideImage;
      link.as = isVideo ? 'video' : 'image';

      // If image, can add fetchPriority
      if (!isVideo) {
        link.fetchPriority = "high";
      }

      document.head.appendChild(link);

      return () => {
        // Optional Cleanup (usually preload links stay)
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      }
    }
  }, [slides]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="flex-1 flex flex-col pt-36 sm:pt-0 pb-8">
      <SnowEffect enabled={snowEffect} />
      {/* Hero Section - Hidden on mobile, visible on sm and up */}
      {slides.length > 0 && (
        <div className="hidden sm:flex flex-col flex-1 overflow-hidden relative">
          {/* Background Slider - Moved up to take full flex-1 container space */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={slides[currentSlide].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {slides[currentSlide].image.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video
                    src={slides[currentSlide].image}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-linear scale-100"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ transform: "scale(1)" }}
                  />
                ) : (
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title || "slide"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-linear"
                    style={{ transform: "scale(1.01)" }}
                  />
                )}
                {/* Added a smoother gradient fade into the background color at the bottom */}
                <div className="absolute top-2/3 bottom-0 left-0 right-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
                {/* Extra bottom gradient for absolute seamless transition */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>

          <section className="relative flex-1 flex flex-col items-center justify-end pb-12 md:pb-20 overflow-hidden z-10 w-full">

            <div className="container relative z-10 flex flex-col items-center text-center px-4 mt-16 md:mt-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slides[currentSlide].id}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="max-w-4xl mx-auto"
                >
                  {(slides[currentSlide].title || slides[currentSlide].highlight || slides[currentSlide].subTitle) && (
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 font-sans leading-tight">
                      {slides[currentSlide].title} {slides[currentSlide].highlight && <span className="text-rose-600">{slides[currentSlide].highlight}</span>}
                      {slides[currentSlide].subTitle && (
                        <>
                          <br />
                          {slides[currentSlide].subTitle}
                        </>
                      )}
                    </h1>
                  )}
                  {slides[currentSlide].description && (
                    <p className="mt-3 max-w-xl mx-auto text-base sm:text-lg text-gray-300 mb-10 leading-relaxed">
                      {slides[currentSlide].description}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Slider Indicators */}
              <div className="mt-8 w-full flex flex-col items-center gap-4">
                {/* Dot Indicators */}
                <div className="flex gap-3">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Services Section - Smoothly overlaps with the hero section */}
      <section className="relative z-20 pb-4 sm:pb-8 flex sm:block items-center -mt-8 sm:-mt-12 backdrop-blur-sm">
        <div className="container mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-5xl mx-auto flex flex-wrap justify-center gap-3 mt-0 sm:gap-4"
          >
            {(homeCards.length > 0 ? homeCards : [
              { icon: 'Camera', label: "Студио", desc: "Мэргэжлийн зураг авалт", href: "/studios" },
              { icon: 'Radio', label: "Шууд дамжуулалт", desc: "Онлайн live streaming", href: "/livestream" },
              { icon: 'Image', label: "Зураглаач", desc: "Гэрэл зурагчны үйлчилгээ", href: "/photographers" },
              { icon: 'Film', label: "Эдит", desc: "Видео эдит & монтаж", href: "/video-editing" },
              { icon: 'Package', label: "Багц", desc: "Хамгийн сайн саналууд", href: "/bundles" },
            ]).map((card, idx) => {
              const Icon = IconMap[card.icon || 'Camera'] || Camera;
              return (
                <Link
                  key={idx}
                  href={card.href || "#"}
                  className="w-[calc(50%-0.375rem)] md:w-auto md:flex-1 min-h-[110px] group flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-4 sm:p-4 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 hover:border-rose-600/40 transition-all duration-300 transform translate-y-4"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-600/10 group-hover:bg-rose-600/20 transition-colors duration-300 mb-0.5">
                    <Icon className="w-5 h-5 text-rose-600" />
                  </div>
                  <p className="text-foreground text-sm font-semibold text-center">{card.label}</p>
                  <p className="text-muted-foreground text-xs text-center leading-snug">{card.desc}</p>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
