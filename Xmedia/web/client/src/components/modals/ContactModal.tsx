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
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
