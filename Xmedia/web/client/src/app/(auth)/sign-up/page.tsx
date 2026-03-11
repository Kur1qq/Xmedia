"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/constants";
import { ArrowLeft, Mail, Lock, Loader2, User, Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

function SignUpContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const login = useAuthStore(state => state.login);

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsLoading(true);

        if (!email || !password || !name) {
            toast.error("Мэдээллээ бүрэн оруулна уу");
            setIsLoading(false);
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const response = await fetch(`${apiUrl}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: name,
                    email,
                    phone,
                    passwordHash: password, // For now passing plain password directly
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Бүртгүүлэхэд алдаа гарлаа");
            }

            const userData = await response.json();

            login({
                id: userData.id.toString(),
                name: userData.username,
                email: userData.email,
                phone: userData.phone,
            });

            toast.success("Амжилттай бүртгүүллээ");
            router.push(callbackUrl);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Бүртгүүлэх үед алдаа гарлаа");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white overflow-hidden">
            {/* Back Button */}
            <Link
                href="/"
                className="absolute left-4 top-4 md:left-8 md:top-8 z-50 flex items-center gap-2 text-sm font-medium text-white hover:text-rose-600 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Нүүр хуудас руу буцах
            </Link>

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[120px] pointer-events-none opacity-20" />
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
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                                    />
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div className="grid gap-2">
                                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Утасны дугаар</span>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="phone"
                                        placeholder="Утасны дугаар"
                                        type="tel"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                                    />
                                </div>
                            </div>

                            <Button disabled={isLoading} className="bg-rose-600 hover:bg-rose-600/90 text-white font-bold h-10 w-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Бүртгүүлэх
                            </Button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Бүртгэлтэй юу?{" "}
                        <Link
                            href={callbackUrl !== "/" ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
                            className="hover:text-rose-600 underline underline-offset-4 transition-colors"
                        >
                            Нэвтрэх
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={null}>
            <SignUpContent />
        </Suspense>
    );
}
