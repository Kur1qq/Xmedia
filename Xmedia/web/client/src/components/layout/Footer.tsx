
import Link from "next/link";
import { siteConfig } from "@/lib/constants";

export function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-black text-white">
            <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
                {/* Logo + copyright */}
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="font-serif font-bold text-white text-base">{siteConfig.name}</span>
                    <span>© {new Date().getFullYear()} — Бүх эрх хамгаалагдсан.</span>
                </div>

                {/* Quick links */}
                <div className="flex items-center gap-5 text-xs text-gray-500">
                    <Link href="/studios" className="hover:text-white transition-colors">Студио</Link>
                    <Link href="/livestream" className="hover:text-white transition-colors">Шууд дамжуулалт</Link>
                    <Link href="/photographers" className="hover:text-white transition-colors">Гэрэл зураг</Link>
                    <Link href="/video-editing" className="hover:text-white transition-colors">Видео эвлүүлэг</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Холбоо барих</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Нууцлал</Link>
                </div>
            </div>
        </footer>
    );
}
