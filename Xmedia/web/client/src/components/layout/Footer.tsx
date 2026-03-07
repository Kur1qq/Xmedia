import Link from "next/link";

export function Footer() {
    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Link
                href="https://www.orgilmedia.mn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-xs font-bold text-white/40 tracking-widest drop-shadow-md hover:text-white/80 transition-colors duration-300"
            >
                POWERED BY ORGILMEDIA
            </Link>
        </div>
    );
}
