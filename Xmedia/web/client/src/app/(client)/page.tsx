"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Radio, Image, Film } from "lucide-react";

// Slide Data
interface Slide {
  id: number;
  title: string;
  highlight: string;
  subTitle: string;
  description: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Мэргэжлийн студио",
    highlight: "түрээсийн",
    subTitle: "үйлчилгээ",
    description: "Зураг авалт, дуу бичлэг, видео продакшн хийхэд зориулсан орчин үеийн тоног төхөөрөмжөөр тоноглогдсон студио.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Шууд дамжуулалтийн",
    highlight: "түрээсийн",
    subTitle: "үйлчилгээ",
    description: "Өндөр чанарын микрофон, дуу тусгаарлагчтай мэргэжлийн орчинд өөрийн бүтээлээ туурвиарай.",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Мэргэжлийн зурагчин",
    highlight: "түрээсийн",
    subTitle: "үйлчилгээ",
    description: "Лекц, сургалт, жижиг хэмжээний тоглолт зохион байгуулахад тохиромжтой тайз, гэрэлтүүлэг бүхий танхим.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-full flex items-start overflow-hidden pt-40">
        {/* Background Slider */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={slides[currentSlide].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 -z-10"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear scale-105"
              style={{ backgroundImage: `url('${slides[currentSlide].image}')`, transform: "scale(1.05)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
          </motion.div>
        </AnimatePresence>

        <div className="container relative z-10 flex flex-col items-center text-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={slides[currentSlide].id}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 font-sans leading-tight">
                {slides[currentSlide].title} <span className="text-primary">{slides[currentSlide].highlight}</span> <br />
                {slides[currentSlide].subTitle}
              </h1>
              <p className="mt-3 max-w-xl mx-auto text-base sm:text-lg text-gray-300 mb-10 leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>



          {/* Slider Progress Bar & Indicators */}
          <div className="mt-16 w-full flex flex-col items-center gap-4">
            {/* Progress Bar */}
            <div className="w-full max-w-md h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                key={currentSlide}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
                className="h-full bg-primary"
              />
            </div>

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

          {/* Service Cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-6 px-4"
          >
            {[
              { icon: Camera, label: "Студио", desc: "Мэргэжлийн зураг авалт", href: "/studios" },
              { icon: Radio, label: "Шууд дамжуулалт", desc: "Онлайн live streaming", href: "/livestream" },
              { icon: Image, label: "Зураглаач", desc: "Гэрэл зурагчны үйлчилгээ", href: "/photographers" },
              { icon: Film, label: "Эдит", desc: "Видео эдит & монтаж", href: "/video-editing" },
            ].map(({ icon: Icon, label, desc, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-primary/40 transition-all duration-300"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mb-2">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-white text-lg font-semibold">{label}</p>
                <p className="text-white/50 text-sm text-center leading-snug">{desc}</p>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
