"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, FileText, Upload } from "lucide-react";

interface ContactSection {
    title: string;
    phone: string;
    email: string;
    color: string;
    instagram?: string;
    facebook?: string;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contactInfo, setContactInfo] = useState<ContactSection[]>([]);
    const [snowEffect, setSnowEffect] = useState(false);
    const [presentationUrl, setPresentationUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchWithAuth("/settings")
            .then((res) => res.json())
            .then((data) => {
                setSnowEffect(data.snowEffect || false);
                setPresentationUrl(data.presentationUrl || "");
                if (data.contactInfo && Array.isArray(data.contactInfo)) {
                    setContactInfo(data.contactInfo);
                } else {
                    setContactInfo([
                        { title: "Жижиг дунд бизнесийн үйлчилгээ", phone: "95905686", email: "Contact@xtudio.mn", color: "rose" },
                        { title: "Групп компания", phone: "91915686", email: "Contact@orgilmedia.mn", color: "blue" }
                    ]);
                }
            })
            .catch(() => toast.error("Тохиргоог татахад алдаа гарлаа."))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetchWithAuth("/settings", {
                method: "PATCH",
                body: JSON.stringify({ snowEffect, contactInfo, presentationUrl }),
            });
            if (!res.ok) throw new Error();
            toast.success("Тохиргоо амжилттай хадгалагдлаа.");
        } catch {
            toast.error("Хадгалахад алдаа гарлаа.");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Зөвхөн PDF файл оруулна уу.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetchWithAuth("/upload", {
                method: "POST",
                body: formData,
                headers: {
                    // FetchWithAuth adds Auth header, we don't set Content-Type for FormData
                },
            });

            if (!res.ok) throw new Error();
            const data = await res.json();
            setPresentationUrl(data.url);
            toast.success("Файл амжилттай хуулагдлаа. Хадгалах товчийг дарж баталгаажуулна уу.");
        } catch {
            toast.error("Файл хуулахад алдаа гарлаа.");
        } finally {
            setIsUploading(false);
        }
    };

    const addSection = () => {
        setContactInfo([...contactInfo, { title: "", phone: "", email: "", color: "rose", instagram: "", facebook: "" }]);
    };

    const removeSection = (index: number) => {
        setContactInfo(contactInfo.filter((_, i) => i !== index));
    };

    const updateSection = (index: number, field: keyof ContactSection, value: string) => {
        const newInfo = [...contactInfo];
        newInfo[index] = { ...newInfo[index], [field]: value };
        setContactInfo(newInfo);
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Сайтын ерөнхий тохиргоо</h1>
                    <p className="text-muted-foreground mt-1">Вэбсайтын мэдээлэл болон эффектүүдийг удирдах.</p>
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Хадгалах
                </button>
            </div>

            {/* Presentation PDF Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl shadow-sm overflow-hidden text-white">
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-rose-500" />
                        Танилцуулга (PDF)
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex flex-col gap-4">
                        {presentationUrl ? (
                            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                <div className="p-2 bg-rose-500/10 rounded">
                                    <FileText className="w-5 h-5 text-rose-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{presentationUrl.split('/').pop()}</p>
                                    <a href={presentationUrl} target="_blank" rel="noreferrer" className="text-xs text-rose-400 hover:underline">Файл харах</a>
                                </div>
                                <button 
                                    onClick={() => setPresentationUrl("")}
                                    className="p-1 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center gap-3 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-8 h-8 text-zinc-500" />
                                <div className="text-center">
                                    <p className="text-sm font-medium">Шинэ PDF файл хуулах</p>
                                    <p className="text-xs text-zinc-400 mt-1">Зөвхөн PDF файл (Макс 10MB)</p>
                                </div>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            accept=".pdf"
                        />
                        {isUploading && (
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Хуулж байна...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl shadow-sm overflow-hidden text-white">
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
                    <h2 className="text-lg font-semibold">Холбоо барих мэдээлэл</h2>
                </div>
                <div className="p-6 space-y-6">
                    {contactInfo.map((section, index) => (
                        <div key={index} className="space-y-4 rounded-lg border border-zinc-800 p-4 relative group bg-zinc-900/50">
                            <button 
                                onClick={() => removeSection(index)}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-rose-500 transition-colors p-1"
                                title="Устгах"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Гарчиг</label>
                                    <input 
                                        value={section.title} 
                                        onChange={(e) => updateSection(index, "title", e.target.value)} 
                                        placeholder="Жишээ: Жижиг дунд бизнесийн үйлчилгээ"
                                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Өнгө (rose эсвэл blue)</label>
                                    <select 
                                        value={section.color} 
                                        onChange={(e) => updateSection(index, "color", e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                    >
                                        <option value="rose">Rose (Улаан)</option>
                                        <option value="blue">Blue (Цэнхэр)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Утас</label>
                                    <input 
                                        value={section.phone} 
                                        onChange={(e) => updateSection(index, "phone", e.target.value)} 
                                        placeholder="95905686"
                                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">И-мэйл</label>
                                    <input 
                                        value={section.email} 
                                        onChange={(e) => updateSection(index, "email", e.target.value)} 
                                        placeholder="Contact@xtudio.mn"
                                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                        Instagram
                                    </label>
                                    <input 
                                        value={section.instagram || ""} 
                                        onChange={(e) => updateSection(index, "instagram" as keyof ContactSection, e.target.value)} 
                                        placeholder="https://instagram.com/xtudio.mn"
                                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                        Facebook
                                    </label>
                                    <input 
                                        value={section.facebook || ""} 
                                        onChange={(e) => updateSection(index, "facebook" as keyof ContactSection, e.target.value)} 
                                        placeholder="https://facebook.com/xtudio.mn"
                                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button 
                      onClick={addSection} 
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-zinc-800 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Шинэ хэсэг нэмэх
                    </button>
                </div>
            </div>

            {/* Other Settings Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl shadow-sm overflow-hidden text-white">
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
                    <h2 className="text-lg font-semibold">Бусад тохиргоо</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="snow" 
                            checked={snowEffect} 
                            onChange={(e) => setSnowEffect(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-rose-500 focus:ring-rose-500"
                        />
                        <label htmlFor="snow" className="text-sm font-medium cursor-pointer text-zinc-300">Цас орох эффект идэвхжүүлэх</label>
                    </div>
                </div>
            </div>
        </div>
    );
}
