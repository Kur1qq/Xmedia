export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-rose-600/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                <div className="text-7xl mb-6">🔧</div>
                <h1 className="text-4xl font-bold mb-4">Засвар үйлчилгээ</h1>
                <p className="text-gray-400 text-lg mb-2">
                    Xtudio.mn вэбсайт одоогоор засвар хийгдэж байна.
                </p>
                <p className="text-gray-500 text-sm">
                    Удахгүй дахин ажиллах болно. Уучлаарай!
                </p>
                <div className="mt-10 px-6 py-3 bg-rose-600/10 border border-rose-600/30 rounded-full text-rose-400 text-sm font-medium">
                    www.xtudio.mn
                </div>
            </div>
        </div>
    );
}
