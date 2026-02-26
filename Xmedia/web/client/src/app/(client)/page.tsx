"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Camera, Mic2, MonitorPlay } from "lucide-react";
import { ParallaxGallery } from "@/components/home/ParallaxGallery";
import { VideoEditingSection } from "@/components/home/VideoEditingSection";
import { LivestreamSection } from "@/components/home/LivestreamSection";
import { FeaturedStudios } from "@/components/home/FeaturedStudios";

// Slide Data
interface Slide {
  id: number;
  badge: string;
  title: string;
  highlight: string;
  subTitle: string;
  description: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: 1,
    badge: "Онцлох",
    title: "Мэргэжлийн студио",
    highlight: "түрээсийн",
    subTitle: "үйлчилгээ",
    description: "Зураг авалт, дуу бичлэг, видео продакшн хийхэд зориулсан орчин үеийн тоног төхөөрөмжөөр тоноглогдсон студио.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    badge: "Шинэ",
    title: "Шууд дамжуулалтийн",
    highlight: "түрээсийн",
    subTitle: "үйлчилгээ",
    description: "Өндөр чанарын микрофон, дуу тусгаарлагчтай мэргэжлийн орчинд өөрийн бүтээлээ туурвиарай.",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    badge: "Эрэлттэй",
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
    }, 10000); // 10 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
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
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-white bg-primary rounded-full">
                {slides[currentSlide].badge}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 font-sans leading-tight">
                {slides[currentSlide].title} <span className="text-primary">{slides[currentSlide].highlight}</span> <br />
                {slides[currentSlide].subTitle}
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-semibold rounded-none bg-white/5 border border-white/30 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] hover:border-primary/50 hover:scale-105 active:scale-95"
            >
              Захиалга өгөх
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-none border-white/30 text-white hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm">
              Дэлгэрэнгүй
            </Button>
          </motion.div>

          {/* Slider Progress Bar & Indicators */}
          <div className="mt-12 w-full flex flex-col items-center gap-4">
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
        </div>
      </section>

      {/* Featured Studios Section */}
      <FeaturedStudios />

      {/* Our Works / Portfolio Section */}
      <section className="w-full py-24 relative z-10 bg-black border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white font-sans">
              Бидний хийсэн <span className="text-primary">ажлууд</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Сүүлийн үед хийгдсэн онцлох бүтээн байгуулалтууд
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 1, title: "Music Video", category: "Production", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" },
              { id: 2, title: "Podcast Series", category: "Studio", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2070&auto=format&fit=crop" },
              { id: 3, title: "Brand Commercial", category: "Ad", image: "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?q=80&w=2070&auto=format&fit=crop" },
              { id: 4, title: "Live Concert", category: "Event", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop" },
            ].map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-80 rounded-xl overflow-hidden cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 bg-gray-800"
                  style={{ backgroundImage: `url('${item.image}')` }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-1">{item.category}</span>
                  <h3 className="text-white text-xl font-bold">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black transition-all">
              Бүгдийг үзэх
            </Button>
          </div>
        </div>
      </section>

      {/* Parallax Gallery Section */}
      <ParallaxGallery />

      {/* Video Editing Section */}
      <VideoEditingSection />

      {/* Livestream Section */}
      <LivestreamSection />
    </>
  );
}
