"use client";

import * as React from "react";
import Link from "next/link";
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
                        <Link href="/" className="font-serif font-bold text-3xl tracking-tight text-white hover:opacity-90 transition-opacity">
                            {siteConfig.name}
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
                            <Button variant="ghost" className="text-white text-sm transition-all duration-300 hover:text-primary hover:bg-white/10">
                                Холбоо барих
                            </Button>
                        </Link>
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="font-semibold text-sm px-4 bg-white/5 border border-white/20 backdrop-blur-sm text-white hover:bg-white/10 flex items-center gap-2">
                                        <UserIcon className="w-4 h-4" />
                                        {user.name}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-black/95 border-white/10 text-white" align="end">
                                    <DropdownMenuItem onClick={() => setIsOrderHistoryOpen(true)} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                                        <UserIcon className="w-4 h-4 mr-2" /> Миний захиалгын түүх
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => logout()} className="text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer mt-1 font-medium focus:text-red-500">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Гарах
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/sign-in">
                                <Button className="font-semibold text-sm px-5 bg-white/5 border border-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] hover:border-red-500/50 hover:scale-105">
                                    Нэвтрэх
                                </Button>
                            </Link>
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
                                <nav className="grid gap-6 text-lg font-medium">
                                    <Link href="#" className="flex items-center gap-2 text-xl font-bold">
                                        {siteConfig.name}
                                    </Link>
                                    {siteConfig.nav.map((item) => (
                                        <Link key={item.href} href={item.href} className="hover:text-foreground" onClick={() => setIsOpen(false)}>
                                            {item.label}
                                        </Link>
                                    ))}
                                    <hr className="my-4" />
                                    <Link href="/contact" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full">Холбоо барих</Button>
                                    </Link>

                                    {user ? (
                                        <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
                                            <div className="flex items-center gap-3 px-2 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 text-gray-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" onClick={() => { setIsOpen(false); setIsOrderHistoryOpen(true); }} className="w-full justify-start gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10">
                                                <UserIcon className="w-4 h-4" /> Миний захиалгын түүх
                                            </Button>
                                            <Button variant="outline" onClick={() => { logout(); setIsOpen(false); }} className="w-full text-red-500 hover:text-red-400 border-red-500/20 hover:bg-red-500/10 justify-start gap-2">
                                                <LogOut className="w-4 h-4" /> Гарах
                                            </Button>
                                        </div>
                                    ) : (
                                        <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full">Нэвтрэх</Button>
                                        </Link>
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
