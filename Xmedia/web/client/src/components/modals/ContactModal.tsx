import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Phone, Mail, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ContactSection {
    title: string;
    phone: string;
    email: string;
    color: string;
}

interface ContactModalProps {
    trigger: React.ReactNode;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function ContactModal({ trigger }: ContactModalProps) {
    const [sections, setSections] = useState<ContactSection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.contactInfo && Array.isArray(data.contactInfo) && data.contactInfo.length > 0) {
                    setSections(data.contactInfo);
                } else {
                    // Fallback
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
        <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent className="w-[400px] p-6 bg-[#0a0a0a]/95 border border-white/10 text-white rounded-2xl shadow-2xl" align="end" sideOffset={10}>
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
                                <h3 className={`text-[15px] font-bold ${section.color === 'blue' ? 'text-blue-500' : 'text-rose-500'} mb-4`}>
                                    {section.title}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <div className="flex items-center gap-2 w-24">
                                            <Phone className="w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
                                            <span className="text-sm text-gray-400">Утас:</span>
                                        </div>
                                        <a href={`tel:${section.phone.replace(/\s+/g, '')}`} className={`text-sm font-medium ${section.color === 'blue' ? 'hover:text-blue-400' : 'hover:text-rose-400'} transition-colors`}>
                                            {section.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex items-center gap-2 w-24 mt-0.5">
                                            <Mail className="w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
                                            <span className="text-sm text-gray-400">И-мэйл:</span>
                                        </div>
                                        <a href={`mailto:${section.email}`} className={`text-sm font-medium ${section.color === 'blue' ? 'hover:text-blue-400' : 'hover:text-rose-400'} transition-colors whitespace-nowrap`}>
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
