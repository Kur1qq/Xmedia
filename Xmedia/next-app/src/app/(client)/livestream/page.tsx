import { LivestreamSection } from "@/components/home/LivestreamSection";

export default function LivestreamPage() {
    return (
        <div className="pt-20 min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 font-sans">
                    Live <span className="text-primary">Stream</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Олон камерын шууд дамжуулалт, онлайн хурал, эвент зохион байгуулах үйлчилгээ.
                </p>
            </div>

            <LivestreamSection />
        </div>
    );
}
