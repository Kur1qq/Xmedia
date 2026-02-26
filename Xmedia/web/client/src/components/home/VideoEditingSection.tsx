"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Maximize2, ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const projects = [
  {
    id: 1,
    title: "Music Video Color Grading",
    category: "Color Grading",
    image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2656&auto=format&fit=crop",
    duration: "03:45",
    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4" 
  },
  {
    id: 2,
    title: "Documentary Edit",
    category: "Documentary",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2670&auto=format&fit=crop",
    duration: "12:30",
    videoUrl: "https://www.youtube.com/embed/LXb3EKWsInQ"
  },
  {
    id: 3,
    title: "Fashion Promo VFX",
    category: "VFX & Motion",
    image: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?q=80&w=2670&auto=format&fit=crop",
    duration: "01:15",
    videoUrl: "https://www.youtube.com/embed/Bey4XXJAqS8"
  }
];

export function VideoEditingSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <>
      <section className="w-full py-24 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white font-sans">
                Video <span className="text-primary">Editing</span> & Post-Production
              </h2>
              <p className="text-gray-400 text-lg">
                Бид таны түүхий дүрсийг мэргэжлийн түвшинд эвлүүлж, өнгө шүүлт (color grading) болон дуу дүрсний гайхалтай хослолыг бүтээнэ.
              </p>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black transition-all group">
              Бүх төслүүд <ArrowUpRight className="ml-2 w-4 h-4 group-hover:rotate-45 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
                onClick={() => setActiveVideo(project.videoUrl)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay & Play Button */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs font-medium text-white border border-white/10">
                    {project.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-primary text-xs font-bold tracking-wider uppercase">{project.category}</span>
                      <h3 className="text-xl font-bold text-white mt-1 group-hover:text-primary transition-colors">{project.title}</h3>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>
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
                src={`${ activeVideo }?autoplay = 1`} 
                title="Video Player"
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
