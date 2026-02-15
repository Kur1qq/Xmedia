"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Activity } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function SearchWidget() {
    const [date, setDate] = React.useState<Date>();

    return (
        <div className="flex flex-col md:flex-row items-center gap-2 p-2 bg-white/95 backdrop-blur-sm border-0 rounded-full shadow-2xl max-w-4xl w-full mx-auto">
            {/* Activity Input */}
            <div className="relative flex-1 w-full md:w-auto group">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                <Input
                    placeholder="What are you planning?"
                    className="pl-12 h-14 border-none bg-transparent hover:bg-gray-100/50 focus-visible:ring-0 text-base text-black placeholder:text-gray-500 rounded-full"
                />
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-200" />

            {/* Location Input */}
            <div className="relative flex-1 w-full md:w-auto group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                <Input
                    placeholder="Where?"
                    defaultValue="Ulaanbaatar, Mongolia"
                    className="pl-12 h-14 border-none bg-transparent hover:bg-gray-100/50 focus-visible:ring-0 text-base text-black placeholder:text-gray-500 rounded-full"
                />
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-200" />

            {/* Date Input */}
            <div className="relative flex-1 w-full md:w-auto group">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className={cn(
                                "w-full justify-start text-left font-normal h-14 pl-12 hover:bg-gray-100/50 text-base rounded-full",
                                !date ? "text-gray-500" : "text-black"
                            )}
                        >
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 mr-2 text-gray-400 group-hover:text-primary transition-colors" />
                            {date ? format(date, "PPP") : <span>When?</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Search Button */}
            <Button size="lg" className="h-12 w-full md:w-auto px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-bold shadow-lg transition-transform hover:scale-105">
                <Search className="mr-2 h-5 w-5" />
                Search
            </Button>
        </div>
    );
}
