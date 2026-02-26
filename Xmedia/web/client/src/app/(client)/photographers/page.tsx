import { ParallaxGallery } from "@/components/home/ParallaxGallery";

export default function PhotographersPage() {
    return (
        <div className="pt-20 min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 font-sans">
                    Professional <span className="text-primary">Photography</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Бүх төрлийн гэрэл зургийн үйлчилгээг мэргэжлийн түвшинд.
                </p>
            </div>

            <ParallaxGallery />
        </div>
    );
}
