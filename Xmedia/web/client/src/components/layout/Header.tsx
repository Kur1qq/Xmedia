"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, User as UserIcon, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth";
import { motion } from "framer-motion";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { OrderHistoryModal } from "@/components/profile/OrderHistoryModal";

export function Header() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isOrderHistoryOpen, setIsOrderHistoryOpen] = React.useState(false);
    const { user, logout } = useAuthStore();

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* ── Main Header Bar ── */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
                    isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"
                )}
            >
                <div className="container flex h-14 items-center justify-between">
                    {/* Logo */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="hover:opacity-90 transition-opacity">
                            <Image src="/x logo.png" alt={siteConfig.name} width={140} height={50} className="object-contain w-auto h-auto" priority />
                        </Link>
                    </div>

                    {/* Desktop: Navigation links */}
                    <div className="hidden lg:flex justify-center items-center">
                        <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-black/70 border border-white/10 backdrop-blur-md shadow-sm shadow-red-500/10">
                            {siteConfig.nav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="px-5 py-1 text-sm font-medium text-white/75 rounded-full transition-all duration-200 hover:text-white hover:bg-white/10"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop: right buttons */}
                    <div className="hidden lg:flex flex-1 justify-end items-center gap-3">
                        <CartDrawer />
                        <Link href="/contact">
                            <Button variant="ghost" className="text-white text-sm transition-all duration-300 hover:text-rose-600 hover:bg-white/10">
                                Холбоо барих
                            </Button>
                        </Link>
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="font-semibold text-sm px-4 bg-white/5 border border-white/20 backdrop-blur-sm text-white hover:bg-white/10 flex items-center gap-2">
                                        <Image src="/xtudio_logo_favico.ico" alt="user" width={16} height={16} className="w-4 h-4 object-contain rounded-sm" />
                                        {user.name}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-black/95 border-white/10 text-white" align="end">
                                    <DropdownMenuItem onClick={() => setIsOrderHistoryOpen(true)} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                                        <UserIcon className="w-4 h-4 mr-2" /> Миний захиалгын түүх
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => logout()} className="text-rose-600 hover:bg-rose-600/10 focus:bg-rose-600/10 cursor-pointer mt-1 font-medium focus:text-rose-600">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Гарах
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <div className="flex items-center justify-end gap-2 lg:hidden flex-1">
                        <CartDrawer />
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/10">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                    <SheetDescription className="sr-only">Access site navigation links</SheetDescription>
                                </SheetHeader>
                                <nav className="flex flex-col gap-6 text-lg font-medium text-center mt-12 pr-4 pl-4">
                                    {siteConfig.nav.map((item) => (
                                        <Link key={item.href} href={item.href} className="hover:text-foreground text-center" onClick={() => setIsOpen(false)}>
                                            {item.label}
                                        </Link>
                                    ))}
                                    <hr className="my-2 border-white/10" />
                                    <Link href="/contact" onClick={() => setIsOpen(false)} className="flex justify-center">
                                        <Button variant="outline" className="w-auto px-8">Холбоо барих</Button>
                                    </Link>

                                    {user && (
                                        <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
                                            <div className="flex flex-col items-center justify-center gap-2 px-2 mb-2">
                                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                                    <Image src="/xtudio_logo_favico.ico" alt="user" width={32} height={32} className="object-contain" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" onClick={() => { setIsOpen(false); setIsOrderHistoryOpen(true); }} className="w-full justify-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10">
                                                <UserIcon className="w-4 h-4" /> Миний захиалгын түүх
                                            </Button>
                                            <Button variant="outline" onClick={() => { logout(); setIsOpen(false); }} className="w-full text-rose-600 hover:text-rose-600 border-rose-600/20 hover:bg-rose-600/10 justify-center gap-2">
                                                <LogOut className="w-4 h-4" /> Гарах
                                            </Button>
                                        </div>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </motion.header>

            {/* Modals outside of header boundary */}
            <OrderHistoryModal isOpen={isOrderHistoryOpen} onClose={() => setIsOrderHistoryOpen(false)} />
        </>
    );
}
