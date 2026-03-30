"use client";

import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Phone, Mail, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ContactSection {
    title: string;
    phone: string;
    email: string;
    color: string;
    instagram?: string;
    facebook?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface ContactModalProps {
    // Optional: pass nav items to render inside the anchor
    presentationUrl?: string;
}

export function ContactModal({ presentationUrl = "/taniltsuulga.pdf" }: ContactModalProps) {
    const [sections, setSections] = useState<ContactSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch(`${API}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.contactInfo && Array.isArray(data.contactInfo) && data.contactInfo.length > 0) {
                    setSections(data.contactInfo);
                } else {
                    setSections([
                        { title: "Жижиг дунд бизнесийн үйлчилгээ", phone: "95905686", email: "Contact@xtudio.mn", color: "rose" },
                        { title: "Групп компани", phone: "91915686", email: "Contact@orgilmedia.mn", color: "blue" }
                    ]);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            {/* Anchor = full nav row — popover centers on this */}
            <PopoverAnchor asChild>
                <div className="hidden lg:flex justify-center items-center gap-10">
                    <Link
                        href={presentationUrl}
                        target="_blank"
                        className="text-white text-[11px] font-light tracking-widest hover:text-[#DF1C54] transition-colors uppercase"
                    >
                        Танилцуулга
                    </Link>
                    <button
                        onClick={() => setOpen(v => !v)}
                        className="text-white text-[11px] font-light tracking-widest hover:text-[#DF1C54] transition-colors uppercase"
                    >
                        Холбоо барих
                    </button>
                </div>
            </PopoverAnchor>

            <PopoverContent
                className="w-[340px] p-6 bg-white/5 backdrop-blur-sm border border-white/15 text-white rounded-2xl shadow-2xl"
                side="bottom"
                align="center"
                sideOffset={14}
            >
                <div className="text-xl font-bold text-center mb-6">
                    Холбоо барих
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-rose-500" /></div>
                    ) : (
                        sections.map((section, idx) => (
                            <div key={idx}>
                                {idx > 0 && <div className="h-px w-full bg-white/5 my-6" />}
                                <h3 className={`text-[15px] font-medium ${section.color === 'blue' ? 'text-white-400' : 'text-white-400'} mb-4`}>
                                    {section.title}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <div className="flex items-center gap-2 w-24">
                                            <Phone className="w-[18px] h-[18px] text-white-400" strokeWidth={1.5} />
                                            <span className="text-sm font-light text-white-400">Утас:</span>
                                        </div>
                                        <a href={`tel:${section.phone.replace(/\s+/g, '')}`} className={`text-sm font-light ${section.color === 'white' ? 'hover:text-rose-400' : 'hover:text-white-400'} transition-colors`}>
                                            {section.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex items-center gap-2 w-24 mt-0.5">
                                            <Mail className="w-[18px] h-[18px] text-white-400" strokeWidth={1.5} />
                                            <span className="text-sm font-light text-white-400">И-мэйл:</span>
                                        </div>
                                        <a href={`mailto:${section.email}`} className={`text-sm font-light ${section.color === 'white' ? 'hover:text-rose-400' : 'hover:text-white-400'} transition-colors whitespace-nowrap`}>
                                            {section.email}
                                        </a>
                                    </div>
                                    {section.instagram && (
                                        <div className="flex items-start">
                                            <div className="flex items-center gap-2 w-24 mt-0.5">
                                                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                                <span className="text-sm font-light">IG:</span>
                                            </div>
                                            <a href={section.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-light hover:text-rose-400 transition-colors truncate">
                                                {section.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')}
                                            </a>
                                        </div>
                                    )}
                                    {section.facebook && (
                                        <div className="flex items-start">
                                            <div className="flex items-center gap-2 w-24 mt-0.5">
                                                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                                <span className="text-sm font-light">FB:</span>
                                            </div>
                                            <a href={section.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-light hover:text-blue-400 transition-colors truncate">
                                                {section.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '').replace(/\/$/, '')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
