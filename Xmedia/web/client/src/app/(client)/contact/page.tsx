import { Mail, Phone, MapPin, Building2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-rose-500/30">
            <Header />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans tracking-tight">Холбоо <span className="text-rose-600">барих</span></h1>
                        <p className="text-gray-400 text-lg">Бидэнтэй холбогдож дэлгэрэнгүй мэдээлэл аваарай</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* SMB Division */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                            <div className="w-12 h-12 bg-rose-600/20 rounded-xl flex items-center justify-center mb-6">
                                <Briefcase className="w-6 h-6 text-rose-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-6 text-white font-sans">Жижиг дунд бизнесийн үйлчилгээ</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1">
                                        <Phone className="w-4 h-4 text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 mb-1">Утас</p>
                                        <a href="tel:95905686" className="text-lg font-semibold hover:text-rose-400 transition-colors">9590 5686</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1">
                                        <Mail className="w-4 h-4 text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 mb-1">И-мэйл</p>
                                        <a href="mailto:Contact@xtudio.mn" className="text-lg font-semibold hover:text-rose-400 transition-colors break-all">Contact@xtudio.mn</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Corporate Division */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6">
                                <Building2 className="w-6 h-6 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-6 text-white font-sans">Групп компанийн холбогдох мэдээлэл</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1">
                                        <Phone className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 mb-1">Утас</p>
                                        <a href="tel:91915686" className="text-lg font-semibold hover:text-blue-400 transition-colors">9191 5686</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 mb-1">И-мэйл</p>
                                        <a href="mailto:Contact@orgilmedia.mn" className="text-lg font-semibold hover:text-blue-400 transition-colors break-all">Contact@orgilmedia.mn</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Abstract Background Elements */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 -right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
                </div>
            </main>
        </div>
    );
}
