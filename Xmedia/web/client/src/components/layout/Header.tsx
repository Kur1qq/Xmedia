"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, User as UserIcon, LogOut, MoreHorizontal, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth";
import { motion } from "framer-motion";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { OrderHistoryModal } from "@/components/profile/OrderHistoryModal";
import { ContactModal } from "@/components/modals/ContactModal";

export function Header() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isOrderHistoryOpen, setIsOrderHistoryOpen] = React.useState(false);
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const [navItems, setNavItems] = React.useState(siteConfig.nav);

    const [presentationUrl, setPresentationUrl] = React.useState("/taniltsuulga.pdf");

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        // Fetch dynamic settings
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    if (data.headerNav && data.headerNav.length > 0) {
                        setNavItems(data.headerNav);
                    }
                    if (data.presentationUrl) {
                        setPresentationUrl(data.presentationUrl);
                    }
                }
            })
            .catch(console.error);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const mainNavItems = navItems.filter(item => 
        ['/studios', '/livestream', '/bundles'].includes(item.href) || 
        ['Студи', 'Шууд дамжуулалт', 'Багц'].some(l => item.label.includes(l))
    );
    const moreNavItems = navItems.filter(item => 
        ['/photographers', '/video-editing'].includes(item.href) || 
        ['Зураглаач', 'Зурагчин', 'Эдит'].some(l => item.label.includes(l))
    );

    return (
        <>
            {/* ── Main Header Bar ── */}
            <div className="fixed top-4 left-0 right-0 z-50 w-full pointer-events-none">
                <div className="w-full max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.header
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "w-full transition-all duration-300 rounded-[40px] pointer-events-auto",
                            isScrolled ? "bg-black/95 backdrop-blur-md shadow-lg py-1" : "bg-black py-1"
                        )}
                    >
                        <div className="px-6 flex h-12 items-center justify-between w-full">
                    {/* Logo */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="hover:opacity-90 transition-opacity">
                            <Image
                                src="/x logo.png"
                                alt="Xtudio logo"
                                width={100}
                                height={36}
                                className="h-10 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop: Navigation links */}
                    <div className="hidden lg:flex justify-center items-center gap-10">
                        <Link href="/taniltsuulga.pdf" target="_blank" className="text-white text-[13px] font-bold tracking-widest hover:text-[#DF1C54] transition-colors uppercase">
                            Танилцуулга
                        </Link>
                        <ContactModal
                            trigger={
                                <button className="text-white text-[13px] font-bold tracking-widest hover:text-[#DF1C54] transition-colors uppercase">
                                    Холбоо барих
                                </button>
                            }
                        />
                    </div>

                    {/* Desktop: right buttons */}
                    <div className="hidden lg:flex flex-1 justify-end items-center gap-3">
                        <CartDrawer />
                        <a href="tel:95905686" className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white hover:bg-[#333] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </a>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white hover:bg-[#333] transition-colors">
                                    <Menu className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-52 bg-black/95 border-white/10 p-2 text-white" align="end">
                                {navItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild className="mb-1 rounded-md">
                                        <Link href={item.href} className="w-full cursor-pointer hover:bg-white/10">
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                                {user && (
                                    <>
                                        <div className="my-1 border-t border-white/10" />
                                        <DropdownMenuItem onClick={() => setIsOrderHistoryOpen(true)} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                                            <UserIcon className="w-4 h-4 mr-2" /> Захиалгын түүх
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => logout()} className="text-rose-500 hover:bg-rose-600/10 focus:bg-rose-600/10 cursor-pointer font-medium focus:text-rose-500">
                                            <LogOut className="w-4 h-4 mr-2" /> Гарах
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile hamburger */}
                    <div className="flex items-center justify-end gap-3 lg:hidden flex-1">
                        <CartDrawer />
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <button className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white hover:bg-[#333] transition-colors shrink-0">
                                    <Menu className="w-5 h-5" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                    <SheetDescription className="sr-only">Access site navigation links</SheetDescription>
                                </SheetHeader>
                                <nav className="flex flex-col gap-4 text-base font-medium text-center mt-6 px-4 overflow-y-auto pb-4 max-h-[85vh]">
                                    {navItems.map((item) => (
                                        <Link key={item.href} href={item.href} className="hover:text-foreground text-center text-[15px]" onClick={() => setIsOpen(false)}>
                                            {item.label}
                                        </Link>
                                    ))}
                                    <hr className="my-1 border-white/10" />
                                    <a href={presentationUrl} download="XTUDIO_Танилцуулга.pdf" target="_blank" rel="noopener noreferrer" className="w-full">
                                        <Button variant="ghost" className="w-full text-white text-sm transition-all duration-300 hover:text-rose-600 hover:bg-white/10">
                                            Танилцуулга татах
                                        </Button>
                                    </a>
                                    <hr className="my-1 border-white/10" />
                                    <div className="flex flex-col gap-2 text-[12px] text-left text-gray-300 bg-white/5 p-3 rounded-xl border border-white/10 mx-auto w-full">
                                        <p className="font-bold text-white mb-1 text-center text-[14px]">Холбоо барих</p>

                                        <div className="space-y-1">
                                            <p className="text-rose-400 font-bold text-[12px]">Жижиг дунд бизнесийн үйлчилгээ</p>
                                            <div className="flex justify-between items-center text-[12px]">
                                                <span className="text-gray-400">Утас:</span>
                                                <a href="tel:95905686" className="text-white">9590 5686</a>
                                            </div>
                                            <div className="flex justify-between items-center text-[12px]">
                                                <span className="text-gray-400">И-мэйл:</span>
                                                <a href="mailto:Contact@xtudio.mn" className="text-white">Contact@xtudio.mn</a>
                                            </div>
                                        </div>

                                        <div className="h-px bg-white/10 w-full my-1"></div>

                                        <div className="space-y-1">
                                            <p className="text-blue-400 font-bold text-[12px]">Групп компани</p>
                                            <div className="flex justify-between items-center text-[12px]">
                                                <span className="text-gray-400">Утас:</span>
                                                <a href="tel:91915686" className="text-white">9191 5686</a>
                                            </div>
                                            <div className="flex justify-between items-center text-[12px]">
                                                <span className="text-gray-400">И-мэйл:</span>
                                                <a href="mailto:Contact@orgilmedia.mn" className="text-white">Contact@orgilmedia.mn</a>
                                            </div>
                                        </div>
                                    </div>

                                    {user && (
                                        <div className="pt-2 mt-1 border-t border-white/10 flex flex-col gap-2">
                                            <div className="flex flex-col items-center justify-center gap-1 px-2 mb-1">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                                    <Image src="/xtudio_logo_favico.ico" alt="user" width={24} height={24} className="object-contain" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-white text-[13px]">{user.name}</p>
                                                    <p className="text-[11px] text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => { setIsOpen(false); setIsOrderHistoryOpen(true); }} className="w-full justify-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-9">
                                                <UserIcon className="w-3.5 h-3.5" /> Миний захиалгын түүх
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => { logout(); setIsOpen(false); }} className="w-full text-rose-600 hover:text-rose-600 border-rose-600/20 hover:bg-rose-600/10 justify-center gap-2 text-xs h-9">
                                                <LogOut className="w-3.5 h-3.5" /> Гарах
                                            </Button>
                                        </div>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </motion.header>
            </div>
            </div>

            {/* Modals outside of header boundary */}
            <OrderHistoryModal isOpen={isOrderHistoryOpen} onClose={() => setIsOrderHistoryOpen(false)} />
        </>
    );
}
