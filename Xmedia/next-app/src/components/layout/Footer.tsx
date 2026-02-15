
import Link from "next/link";
import { siteConfig } from "@/lib/constants";

export function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-black text-white">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold font-serif">{siteConfig.name}</span>
                        </Link>
                        <p className="mt-4 text-sm text-gray-400">
                            {siteConfig.description}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Үйлчилгээ</h3>
                        <ul className="mt-4 space-y-2 text-sm text-gray-400">
                            <li><Link href="/studios" className="hover:text-white transition-colors">Студио</Link></li>
                            <li><Link href="/livestream" className="hover:text-white transition-colors">Шууд дамжуулалт</Link></li>
                            <li><Link href="/photographers" className="hover:text-white transition-colors">Гэрэл зураг</Link></li>
                            <li><Link href="/video-editing" className="hover:text-white transition-colors">Видео эвлүүлэг</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Компани</h3>
                        <ul className="mt-4 space-y-2 text-sm text-gray-400">
                            <li><Link href="/about" className="hover:text-white transition-colors">Бидний тухай</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Холбоо барих</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Ажилд урьж байна</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Үйлчилгээний нөхцөл</h3>
                        <ul className="mt-4 space-y-2 text-sm text-gray-400">
                            <li><Link href="/terms" className="hover:text-white transition-colors">Үйлчилгээний нөхцөл</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Нууцлалын бодлого</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} {siteConfig.name}. Бүх эрх хуулиар хамгаалагдсан.
                </div>
            </div>
        </footer>
    );
}
