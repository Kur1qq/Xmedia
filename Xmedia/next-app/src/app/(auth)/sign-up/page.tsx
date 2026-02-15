"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/constants";
import { ArrowLeft, Mail, Lock, Loader2, Github, User } from "lucide-react";

export default function SignUpPage() {
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
        }, 3000);
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white overflow-hidden">
            {/* Back Button */}
            <Link
                href="/"
                className="absolute left-4 top-4 md:left-8 md:top-8 z-50 flex items-center gap-2 text-sm font-medium text-white hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-20" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none opacity-20" />

            {/* Form Container */}
            <div className="w-full max-w-[400px] p-8 space-y-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm relative z-10 mx-4">
                <div className="flex flex-col space-y-2 text-center">
                    <Link href="/" className="mx-auto mb-4">
                        <span className="text-2xl font-bold font-serif tracking-tight">{siteConfig.name}</span>
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Бүртгүүлэх
                    </h1>
                    <p className="text-sm text-muted-foreground text-gray-400">
                        Шинээр бүртгэл үүсгэх
                    </p>
                </div>

                <div className="grid gap-6">
                    <form onSubmit={onSubmit}>
                        <div className="grid gap-4">
                            {/* Name Input */}
                            <div className="grid gap-2">
                                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Нэр</span>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="name"
                                        placeholder="Таны нэр"
                                        type="text"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="grid gap-2">
                                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">И-мэйл</span>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="grid gap-2">
                                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Нууц үг</span>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="password"
                                        placeholder="••••••••"
                                        type="password"
                                        autoCapitalize="none"
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                                    />
                                </div>
                            </div>

                            <Button disabled={isLoading} className="bg-primary hover:bg-red-600 text-white font-bold h-10 w-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Бүртгүүлэх
                            </Button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-gray-400">
                                Эсвэл
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" disabled={isLoading} className="border-white/10 bg-white/5 hover:bg-white/10 text-white w-full">
                            <Github className="mr-2 h-4 w-4" />
                            Github
                        </Button>
                        <Button variant="outline" disabled={isLoading} className="border-white/10 bg-white/5 hover:bg-white/10 text-white w-full">
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </Button>
                    </div>

                    <p className="text-center text-sm text-gray-400">
                        Бүртгэлтэй юу?{" "}
                        <Link
                            href="/sign-in"
                            className="hover:text-primary underline underline-offset-4 transition-colors"
                        >
                            Нэвтрэх
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
