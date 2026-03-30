"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();

    if (pathname !== "/") return null;

    return (
        <div className="fixed bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-50 text-center w-full">
            <Link
                href="https://www.orgilmedia.mn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-[11px] font-medium text-black tracking-[0.2em] hover:opacity-70 transition-opacity duration-300 pointer-events-auto"
            >
                POWERED BY <strong className="font-extrabold">ORGIL</strong>MEDIA
            </Link>
        </div>
    );
}
