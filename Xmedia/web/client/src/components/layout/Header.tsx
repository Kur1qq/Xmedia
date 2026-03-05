"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Header() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);

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
                    <Link href="/" className="font-serif font-bold text-3xl tracking-tight text-white hover:opacity-90 transition-opacity">
                        {siteConfig.name}
                    </Link>

                    {/* Desktop: right buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <CartDrawer />
                        <Link href="/contact">
                            <Button variant="ghost" className="text-white text-sm transition-all duration-300 hover:text-primary hover:bg-white/10">
                                Холбоо барих
                            </Button>
                        </Link>
                        <Link href="/booking">
                            <Button className="font-semibold text-sm px-5 bg-white/5 border border-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] hover:border-red-500/50 hover:scale-105">
                                Захиалга өгөх
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <div className="flex items-center gap-2 md:hidden">
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
                                    <Link href="/booking" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full">Захиалга өгөх</Button>
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </motion.header>

            {/* ── Floating Nav Pill (desktop only) ── */}
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.15 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-40 hidden md:flex"
            >
                <div className="flex items-center gap-1 px-4 py-2 rounded-full bg-black/70 border border-white/10 backdrop-blur-md shadow-lg shadow-red-500/20">
                    {siteConfig.nav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-5 py-1.5 text-sm font-medium text-white/75 rounded-full transition-all duration-200 hover:text-white hover:bg-white/10"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </motion.div>
        </>
    );
}
