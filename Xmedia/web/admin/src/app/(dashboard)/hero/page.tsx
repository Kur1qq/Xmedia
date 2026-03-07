"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";

export default function HeroPage() {
    const [loading, setLoading] = useState(true);
    const [slides, setSlides] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingSlide, setEditingSlide] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        highlight: "",
        subTitle: "",
        description: "",
        image: "",
        order: "",
        isActive: true,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/hero`);
            if (res.ok) {
                setSlides(await res.json());
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Өгөгдөл татахад алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload`, {
                method: 'POST',
                headers: {
                    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
                },
                body: uploadData,
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, image: data.url }));
                toast.success("Файл амжилттай хуулагдлаа!");
            } else {
                toast.error("Файл хуулахад алдаа гарлаа.");
            }
        } catch (error) {
            console.error("Image upload failed", error);
            toast.error("Сервертэй холбогдоход алдаа гарлаа.");
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleOpenModal = (slide: any = null) => {
        if (slide) {
            setEditingSlide(slide);
            setFormData({
                title: slide.title || "",
                highlight: slide.highlight || "",
                subTitle: slide.subTitle || "",
                description: slide.description || "",
                image: slide.image || "",
                order: slide.order?.toString() || "0",
                isActive: slide.isActive,
            });
        } else {
            setEditingSlide(null);
            setFormData({
                title: "",
                highlight: "",
                subTitle: "",
                description: "",
                image: "",
                order: "0",
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const method = editingSlide ? 'PATCH' : 'POST';
            const url = editingSlide
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/hero/${editingSlide.id}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/hero`;

            const payload = {
                ...formData,
                order: formData.order ? parseInt(formData.order) : 0,
                // Ensure auth headers if needed:
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchData();
                setIsModalOpen(false);
                toast.success(editingSlide ? "Слайд шинэчлэгдлээ" : "Слайд нэмэгдлээ");
            } else {
                toast.error("Хадгалахад алдаа гарлаа.");
            }
        } catch (error) {
            toast.error("Сервертэй холбогдоход алдаа гарлаа.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/hero/${id}`, {
                method: 'DELETE',
                headers: {
                    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
                }
            });
            if (res.ok) {
                setSlides(slides.filter(s => s.id !== id));
                toast.success("Устгагдлаа");
            } else {
                toast.error("Устгахад алдаа гарлаа.");
            }
        } catch (error) {
            toast.error("Сервертэй холбогдоход алдаа гарлаа.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Нүүр хуудасны слайд</h1>
                <p className="text-muted-foreground mt-1">Хэрэглэгчийн нүүр хуудас дээр харагдах зургууд болон текстүүдийг удирдах хэсэг.</p>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Слайдууд</h2>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Нэмэх
                </button>
            </div>

            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium border-b w-[120px]">Зураг / Бичлэг</th>
                            <th className="px-6 py-4 font-medium border-b">Гарчиг (title, highlight, subTitle)</th>
                            <th className="px-6 py-4 font-medium border-b w-[80px]">Дараалал</th>
                            <th className="px-6 py-4 font-medium border-b w-[100px]">Төлөв</th>
                            <th className="px-6 py-4 font-medium border-b w-[120px] text-right">Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (<tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                            : slides.length === 0 ? (<tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Бүртгэл алга байна.</td></tr>)
                                : slides.map((s) => (
                                    <tr key={s.id} className="hover:bg-muted/30">
                                        <td className="px-6 py-4">
                                            {s.image ? (
                                                <div className="w-16 h-10 rounded overflow-hidden">
                                                    {s.image.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                                        <video src={s.image} className="w-full h-full object-cover" muted loop />
                                                    ) : (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            ) : <div className="w-16 h-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{s.title} <span className="text-primary">{s.highlight}</span> {s.subTitle}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[300px] mt-1">{s.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">{s.order}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                                {s.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => handleOpenModal(s)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(s.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            {/* SHARED IMAGE INPUT (Hidden) */}
            <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

            {/* ===================================== */}
            {/* HERO MODAL */}
            {/* ===================================== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !isSaving && setIsModalOpen(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingSlide ? 'Слайд засах' : 'Шинэ слайд нэмэх'}</h2>
                            <button onClick={() => !isSaving && setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="hero-form" onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 flex items-center justify-between block">
                                        Зураг / Бичлэг (Background cover)
                                        {formData.image && (
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: "" }))} className="text-[10px] text-red-500 hover:underline">Устгах</button>
                                        )}
                                    </label>
                                    <div className="flex gap-4 items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="w-24 h-16 shrink-0 rounded-md border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                                            {formData.image ? (
                                                formData.image.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                                    <video src={formData.image} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                                                ) : (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={formData.image} alt="" className="w-full h-full object-cover" />
                                                )
                                            ) : <ImageIcon className="w-6 h-6 text-gray-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage} className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-white/20 bg-black/20 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors focus-visible:outline-none">
                                                {isUploadingImage ? <span className="animate-pulse">Хуулж байна (Бичлэг байвал удах магадлалтай)...</span> : <><UploadCloud className="w-4 h-4" /> Зураг ба Бичлэг сонгох</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 block">Гарчиг (Эхний хэсэг) <span className="text-red-500">*</span></label>
                                        <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Мэргэжлийн студио" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 block">Тодруулах үг (Улаан өнгөөр)</label>
                                        <input value={formData.highlight} onChange={e => setFormData({ ...formData, highlight: e.target.value })} placeholder="түрээсийн" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 block">Гарчиг (Сүүлийн хэсэг)</label>
                                        <input value={formData.subTitle} onChange={e => setFormData({ ...formData, subTitle: e.target.value })} placeholder="үйлчилгээ" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 block">Дэлгэрэнгүй тайлбар</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 block">Дараалал (Order)</label>
                                        <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div className="flex items-center pt-5">
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input type="checkbox" className="accent-primary" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                            Идэвхтэй харуулах
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                                Болих
                            </button>
                            <button type="submit" form="hero-form" disabled={isSaving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSaving ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
