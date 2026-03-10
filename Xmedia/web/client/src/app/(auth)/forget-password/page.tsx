"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/constants";
import { ArrowLeft, Mail, Loader2, KeyRound, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    async function onCheckEmail(event: React.FormEvent) {
        event.preventDefault();

        if (!email) {
            toast.error("И-мэйл хаягаа оруулна уу");
            return;
        }

        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const response = await fetch(`${apiUrl}/users/check-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) throw new Error("Алдаа гарлаа");
            const data = await response.json();

            if (data.exists) {
                setStep(2);
            } else {
                toast.error("Энэ имэйл хаяг бүртгэлгүй байна.");
            }
        } catch (error) {
            toast.error("Системтэй холбогдоход алдаа гарлаа");
        } finally {
            setIsLoading(false);
        }
    }

    async function onResetPassword(event: React.FormEvent) {
        event.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error("Нууц үгээ гүйцэд оруулна уу");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Нууц үг хоорондоо таарахгүй байна");
            return;
        }

        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const response = await fetch(`${apiUrl}/users/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, passwordHash: newPassword }),
            });

            if (!response.ok) throw new Error("Алдаа гарлаа");

            toast.success("Нууц үг амжилттай шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү.");
            router.push("/sign-in");
        } catch (error) {
            toast.error("Нууц үг шинэчлэхэд алдаа гарлаа");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white overflow-hidden">
            {/* Back Button */}
            <Link
                href="/sign-in"
                className="absolute left-4 top-4 md:left-8 md:top-8 z-50 flex items-center gap-2 text-sm font-medium text-white hover:text-rose-600 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Нэвтрэх хэсэг рүү буцах
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
                    <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                        <KeyRound className="w-6 h-6 text-rose-600" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Нууц үг сэргээх
                    </h1>
                    <p className="text-sm text-muted-foreground text-gray-400">
                        {step === 1 ? "Бүртгэлтэй имэйл хаягаа оруулна уу." : "Шинэ нууц үгээ оруулна уу."}
                    </p>
                </div>

                <div className="grid gap-6">
                    {step === 1 ? (
                        <form onSubmit={onCheckEmail}>
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

                                <Button disabled={isLoading} className="bg-rose-600 hover:bg-rose-600/90 text-white font-bold h-10 w-full mt-2">
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Үргэлжлүүлэх
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={onResetPassword}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Шинэ нууц үг</span>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            id="newPassword"
                                            placeholder="••••••••"
                                            type="password"
                                            autoCapitalize="none"
                                            autoComplete="new-password"
                                            disabled={isLoading}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Нууц үг давтах</span>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            id="confirmPassword"
                                            placeholder="••••••••"
                                            type="password"
                                            autoCapitalize="none"
                                            autoComplete="new-password"
                                            disabled={isLoading}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                                        />
                                    </div>
                                </div>

                                <Button disabled={isLoading} className="bg-rose-600 hover:bg-rose-600/90 text-white font-bold h-10 w-full mt-2">
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Нууц үг шинэчлэх
                                </Button>

                                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isLoading} className="bg-white/5 border-white/10 text-white hover:bg-white/10 w-full h-10 mt-1">
                                    Буцах
                                </Button>
                            </div>
                        </form>
                    )}

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Нууц үгээ санасан уу?{" "}
                        <Link
                            href="/sign-in"
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
