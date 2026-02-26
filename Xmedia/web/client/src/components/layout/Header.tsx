"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
                isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-2" : "bg-transparent py-4"
            )}
        >
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-serif font-bold text-3xl tracking-tight text-white hover:opacity-90 transition-opacity">
                        <span>{siteConfig.name}</span>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    {siteConfig.nav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-lg font-medium text-white/90 transition-all duration-300 hover:text-primary hover:scale-110"
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div className="flex items-center gap-4 ml-4">
                        <Link href="/sign-in">
                            <Button variant="ghost" className="text-white text-lg transition-all duration-300 hover:text-primary hover:bg-white/10 hover:scale-105">
                                Нэвтрэх
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className="font-semibold text-lg px-6 bg-white/5 border border-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] hover:border-red-500/50 hover:scale-105">
                                Шинэ хэрэглэгч
                            </Button>
                        </Link>
                    </div>
                </nav>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 md:hidden text-white hover:bg-white/10"
                        >
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <SheetDescription className="sr-only">
                                Access site navigation links
                            </SheetDescription>
                        </SheetHeader>
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link href="#" className="flex items-center gap-2 text-xl font-bold">
                                {siteConfig.name}
                            </Link>
                            {siteConfig.nav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="hover:text-foreground"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <hr className="my-4" />
                            <Button variant="outline" className="w-full">
                                Sign In
                            </Button>
                            <Button className="w-full">Get Started</Button>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </motion.header>
    );
}
