"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Radio, Image, Film, Package, Mic, MonitorPlay, Video } from "lucide-react";

const IconMap: Record<string, any> = {
  Camera, Radio, Image, Film, Package, Mic, MonitorPlay, Video
};
import SnowEffect from "@/components/SnowEffect";
import { cn } from "@/lib/utils";

// Slide Data
interface Slide {
  id: number;
  title: string;
  highlight: string;
  subTitle: string;
  description: string;
  image: string;
  buttonLink?: string;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const touchStartX = useRef<number | null>(null);
  const [slidesLoading, setSlidesLoading] = useState(true);
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
      } finally {
        setSlidesLoading(false);
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
    <div className="flex-1 flex flex-col pt-0 bg-[#f5f5f5] h-[100dvh] overflow-hidden">
      <SnowEffect enabled={snowEffect} />
      {/* Hero Section */}
      {slidesLoading ? (
        <div className="flex flex-col relative px-4 sm:px-6 lg:px-8 pt-20 pb-0 max-w-[2560px] mx-auto w-full flex-1 min-h-[120px]">
          <div className="absolute inset-x-4 top-20 bottom-0 sm:bottom-12 sm:inset-x-6 lg:inset-x-8 z-0 rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[#111] animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      ) : slides.length > 0 && (
        <div className="flex flex-col relative px-4 sm:px-6 lg:px-8 pt-20 pb-0 max-w-[2560px] mx-auto w-full flex-1 min-h-[120px]">
          {/* Background Slider Container */}
          <div 
            className="absolute inset-x-4 top-20 bottom-0 sm:bottom-12 sm:inset-x-6 lg:inset-x-8 z-0 rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-2xl touch-pan-y select-none"
            onTouchStart={(e) => { touchStartX.current = e.targetTouches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const distance = touchStartX.current - e.changedTouches[0].clientX;
              if (distance > 50) setCurrentSlide((prev) => (prev + 1) % slides.length);
              else if (distance < -50) setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
              touchStartX.current = null;
            }}
            onMouseDown={(e) => { touchStartX.current = e.clientX; }}
            onMouseUp={(e) => {
              if (touchStartX.current === null) return;
              const distance = touchStartX.current - e.clientX;
              if (distance > 50) setCurrentSlide((prev) => (prev + 1) % slides.length);
              else if (distance < -50) setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
              touchStartX.current = null;
            }}
            onMouseLeave={() => { touchStartX.current = null; }}
          >
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
                {/* Subtle overlay to make text readable */}
                <div className="absolute inset-0 bg-black/30" />
              </motion.div>
            </AnimatePresence>
          </div>

          <section className="relative flex-1 hidden sm:flex flex-col items-start justify-center pb-20 md:pb-28 z-10 w-full">
            <div className="container relative z-10 flex flex-col items-start text-left px-4 mt-20 md:mt-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slides[currentSlide].id}
                  initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="max-w-4xl"
                >
                  {/* Title: first part + highlighted word + last part */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-white mb-3 leading-tight">
                    {slides[currentSlide].title && (
                      <span>{slides[currentSlide].title} </span>
                    )}
                    {slides[currentSlide].highlight && (
                      <span className="text-primary">{slides[currentSlide].highlight}</span>
                    )}
                    {slides[currentSlide].subTitle && (
                      <span> {slides[currentSlide].subTitle}</span>
                    )}
                  </h1>

                  {/* Description */}
                  {slides[currentSlide].description && (
                    <p className="text-sm sm:text-base text-white/70 font-medium mb-6 max-w-lg">
                      {slides[currentSlide].description}
                    </p>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >

                  </motion.div>
                </motion.div>
              </AnimatePresence>

            </div>
          </section>

          {/* Slider Indicators — positioned just above cards */}
          <div className="absolute z-30 hidden sm:flex justify-center gap-3 inset-x-0 bottom-40 lg:bottom-44">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-xl ${index === currentSlide ? "w-12 bg-rose-600" : "w-6 bg-white/70 hover:bg-white"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Services Section - Overlaps exactly half of its height over the image */}
      <section className="relative z-20 flex items-center mt-3 sm:-mt-[98px]">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[2560px] mx-auto pb-4 sm:pb-8 lg:pb-12 xl:pb-16 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full flex flex-wrap lg:flex-nowrap justify-center gap-3 sm:gap-4 lg:gap-5"
          >
            {(homeCards.length > 0 ? homeCards : [
              { icon: 'Camera', label: "СТУДИ ТҮРЭЭС", href: "/studios" },
              { icon: 'Video', label: "ЗУРАГЧИН &\nЗУРАГЛААЧ", href: "/photographers" },
              { icon: 'MonitorPlay', label: "ШУУД\nДАМЖУУЛАЛТ", href: "/livestream" },
              { icon: 'Film', label: "ВИДЕО &\nФОТО ЭДИТ", href: "/video-editing" },
              { icon: 'Package', label: "БАГЦ ҮЙЛЧИЛГЭЭ", href: "/bundles" },
            ]).map((card, idx) => {
              const Icon = IconMap[card.icon || 'Camera'] || Camera;
              return (
                <Link
                  key={idx}
                  href={card.href || "#"}
                  className="w-[calc(50%-0.6rem)] lg:flex-1 lg:max-w-[220px] h-[100px] sm:h-[110px] group flex flex-col items-center justify-center gap-3 p-3 sm:p-4 rounded-[20px] bg-[#111] hover:bg-[#1A1A1A] transition-all duration-300 shadow-2xl"
                >
                  <Icon strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover:text-[#DF1C54] transition-colors" />
                  <p className="text-white font-medium text-[11px] sm:text-xs text-center leading-tight whitespace-pre-line tracking-wide">
                    {card.label}
                  </p>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Mobile Footer - Natural Flow to avoid Safari viewport cut-offs */}
      <div className="md:hidden w-full text-center pb-6 z-50 shrink-0">
        <Link
          href="https://www.orgilmedia.mn/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] sm:text-[11px] font-medium text-black tracking-[0.2em] hover:opacity-70 transition-opacity duration-300 pointer-events-auto"
        >
          POWERED BY <strong className="font-extrabold">ORGIL</strong>MEDIA
        </Link>
      </div>
    </div>
  );
}
