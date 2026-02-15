import { VideoEditingSection } from "@/components/home/VideoEditingSection";

export default function VideoEditingPage() {
    return (
        <div className="pt-20 min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 font-sans">
                    Video <span className="text-primary">Editing</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Эвлүүлэг, Color Grading, VFX болон Motion Graphic үйлчилгээ.
                </p>
            </div>

            <VideoEditingSection />
        </div>
    );
}
