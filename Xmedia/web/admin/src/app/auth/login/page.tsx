"use client";

import { useState } from "react";
import { Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { saveLoginResult } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (res.ok) {
                const data = await res.json();
                await saveLoginResult(data.token, data.admin);
                window.location.href = '/';
            } else {
                const err = await res.json().catch(() => ({}));
                setError(err?.message || 'Нэвтрэх нэр эсвэл нууц үг буруу байна.');
            }
        } catch {
            setError('Сервертэй холбогдоход алдаа гарлаа.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-primary/20 flex items-center justify-center rounded-2xl border border-primary/30 shadow-lg shadow-primary/20">
                        <span className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/50">X</span>
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-white">Админ нэвтрэх</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">Xtudio удирдлагын систем</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-zinc-950/50 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-black/50 sm:rounded-2xl sm:px-10 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Нэвтрэх нэр</label>
                            <div className="mt-2 relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="block w-full pl-10 bg-black/50 border border-white/10 rounded-lg py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                                    placeholder="admin"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">Нууц үг</label>
                            <div className="mt-2 relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 bg-black/50 border border-white/10 rounded-lg py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-white transition-colors">
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary transition-all overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Нэвтэрч байна...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Нэвтрэх <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-xs text-muted-foreground/50">
                    &copy; {new Date().getFullYear()} Xmedia LLC. Бүх эрх хуулиар хамгаалагдсан.
                </p>
            </div>
        </div>
    );
}
