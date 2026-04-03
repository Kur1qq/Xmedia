"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Footer() {
    const pathname = usePathname();
    const [footerData, setFooterData] = useState<{ isActive?: boolean; name?: string; link?: string } | null>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/settings`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.footerData) {
                    setFooterData(d.footerData);
                }
            })
            .catch(() => {});
    }, []);

    if (pathname !== "/") return null;
    if (footerData?.isActive === false) return null;

    const name = footerData?.name || "ORGIL MEDIA";
    const link = footerData?.link || "https://www.orgilmedia.mn/";

    return (
        <div className="hidden md:block fixed bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-50 text-center w-full">
            <Link
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-[11px] font-medium text-black tracking-[0.2em] hover:opacity-70 transition-opacity duration-300 pointer-events-auto"
            >
                POWERED BY <strong className="font-extrabold">{name}</strong>
            </Link>
        </div>
    );
}
