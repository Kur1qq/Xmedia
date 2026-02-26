"use client";

import { Bell, Search } from "lucide-react";

export function Header() {
    return (
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 lg:pl-6 pl-16">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Хайх..."
                        className="w-full bg-muted/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground text-foreground"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border border-white"></span>
                </button>

                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent border-2 border-background shadow-sm overflow-hidden flex items-center justify-center text-primary-foreground font-medium text-xs">
                    A
                </div>
            </div>
        </header>
    );
}
