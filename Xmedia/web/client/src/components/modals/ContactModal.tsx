import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Phone, Mail } from "lucide-react";

interface ContactModalProps {
    trigger: React.ReactNode;
}

export function ContactModal({ trigger }: ContactModalProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent className="w-[400px] p-6 bg-[#0a0a0a]/95 border border-white/10 text-white rounded-2xl shadow-2xl" align="end" sideOffset={10}>
                <div className="text-xl font-bold text-center mb-6">
                    Холбоо барих
                </div>

                <div className="space-y-6">
                    {/* SMB Division */}
                    <div>
                        <h3 className="text-[15px] font-bold text-rose-500 mb-4">Жижиг дунд бизнесийн үйлчилгээ</h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <div className="flex items-center gap-2 w-24">
                                    <Phone className="w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
                                    <span className="text-sm text-gray-400">Утас:</span>
                                </div>
                                <a href="tel:95905686" className="text-sm font-medium hover:text-rose-400 transition-colors">9590 5686</a>
                            </div>
                            <div className="flex items-start">
                                <div className="flex items-center gap-2 w-24 mt-0.5">
                                    <Mail className="w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
                                    <span className="text-sm text-gray-400">И-мэйл:</span>
                                </div>
                                <a href="mailto:Contact@xtudio.mn" className="text-sm font-medium hover:text-rose-400 transition-colors whitespace-nowrap">Contact@xtudio.mn</a>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5 my-6" />

                    {/* Corporate Division */}
                    <div>
                        <h3 className="text-[15px] font-bold text-blue-500 mb-4">Групп компани</h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <div className="flex items-center gap-2 w-24">
                                    <Phone className="w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
                                    <span className="text-sm text-gray-400">Утас:</span>
                                </div>
                                <a href="tel:91915686" className="text-sm font-medium hover:text-blue-400 transition-colors">9191 5686</a>
                            </div>
                            <div className="flex items-start">
                                <div className="flex items-center gap-2 w-24 mt-0.5">
                                    <Mail className="w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
                                    <span className="text-sm text-gray-400">И-мэйл:</span>
                                </div>
                                <a href="mailto:Contact@orgilmedia.mn" className="text-sm font-medium hover:text-blue-400 transition-colors whitespace-nowrap">Contact@orgilmedia.mn</a>
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
