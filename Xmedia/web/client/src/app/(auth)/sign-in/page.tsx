"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/constants";
import { ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

function SignInContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const login = useAuthStore(state => state.login);

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!email || !password) {
            toast.error("И-мэйл болон нууц үгээ оруулна уу");
            return;
        }

        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const response = await fetch(`${apiUrl}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, passwordHash: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Нэвтрэх нэр эсвэл нууц үг буруу байна");
                return;
            }

            // Real login success mapping backend user object shape to client store shape
            login({
                id: data.id.toString(),
                name: data.username,
                email: data.email,
                phone: data.phone || "",
            });

            toast.success("Амжилттай нэвтэрлээ");
            router.push(callbackUrl);
        } catch (error) {
            toast.error("Системтэй холбогдоход алдаа гарлаа");
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
                        Тавтай морил
                    </h1>
                    <p className="text-sm text-muted-foreground text-gray-400">
                        Системд нэвтрэх
                    </p>
                </div>

                <div className="grid gap-6">
                    <form onSubmit={onSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Имэйл</span>
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
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Нууц үг</span>
                                    <Link href="/forget-password" className="text-xs text-rose-600 hover:underline">Нууц үгээ мартсан уу?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="password"
                                        placeholder="••••••••"
                                        type="password"
                                        autoCapitalize="none"
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                                    />
                                </div>
                            </div>
                            <Button disabled={isLoading} className="bg-rose-600 hover:bg-rose-600/90 text-white font-bold h-10 w-full">
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Нэвтрэх
                            </Button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Бүртгэлгүй юу?{" "}
                        <Link
                            href={callbackUrl !== "/" ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-up"}
                            className="hover:text-rose-600 underline underline-offset-4 transition-colors"
                        >
                            Бүртгүүлэх
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={null}>
            <SignInContent />
        </Suspense>
    );
}
