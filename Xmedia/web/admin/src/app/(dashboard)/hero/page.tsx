"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, Image as ImageIcon, UploadCloud, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";

export default function HeroPage() {
    const [loading, setLoading] = useState(true);
    const [slides, setSlides] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingSlide, setEditingSlide] = useState<any | null>(null);
    const [snowEffect, setSnowEffect] = useState(false);
    const [headerNav, setHeaderNav] = useState<any[]>([]);
    const [homeCards, setHomeCards] = useState<any[]>([]);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        highlight: "",
        subTitle: "",
        description: "",
        image: "",
        order: "",
        isActive: true,
        buttonLink: "/studios",
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
        // Fetch settings
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d) {
                    setSnowEffect(!!d.snowEffect);
                    setHeaderNav(d.headerNav || []);
                    setHomeCards(d.homeCards || []);
                    setLogoUrl(d.logoUrl || "");
                }
            })
            .catch(console.error);
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
                buttonLink: slide.buttonLink || "/studios",
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
                buttonLink: "/studios",
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

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
                },
                body: JSON.stringify({ snowEffect, headerNav, homeCards, logoUrl }),
            });
            if (res.ok) {
                toast.success("Сайтын тохиргоо хадгалагдлаа!");
            } else {
                toast.error("Тохиргоо хадгалахад алдаа гарлаа.");
            }
        } catch {
            toast.error("Сервертэй холбогдоход алдаа гарлаа.");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingLogo(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload`, {
                method: 'POST',
                headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
                body: fd,
            });
            if (res.ok) {
                const data = await res.json();
                setLogoUrl(data.url);
                toast.success("Лого амжилттай хуулагдлаа! Хадгалахыг дарна уу.");
            } else { toast.error("Лого хуулахад алдаа гарлаа."); }
        } catch { toast.error("Сервертэй холбогдоход алдаа гарлаа."); }
        finally { setIsUploadingLogo(false); if (logoInputRef.current) logoInputRef.current.value = ''; }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Нүүр хуудасны слайд</h1>
                <p className="text-muted-foreground mt-1">Хэрэглэгчийн нүүр хуудас дээр харагдах зургууд болон текстүүдийг удирдах хэсэг.</p>
            </div>

            {/* Site Settings Section */}
            <div className="rounded-md border border-border/50 bg-card p-6 space-y-8">
                <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border border-border/50">
                    <div>
                        <h2 className="text-lg font-semibold">Сайтын Ерөнхий Тохиргоо</h2>
                        <p className="text-sm text-muted-foreground mb-4">Цасны эффект, дээд цэс болон доод картуудыг тохируулах.</p>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSavingSettings ? "Хадгалж байна..." : "Өөрчлөлтүүдийг хадгалах"}
                    </button>
                </div>

                {/* Snow Effect Toggle Card */}
                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${snowEffect ? 'bg-blue-500/20' : 'bg-muted/50'}`}>
                            <Snowflake className={`w-5 h-5 transition-colors duration-300 ${snowEffect ? 'text-blue-400' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Цасны эффект</p>
                            <p className="text-xs text-muted-foreground">Хэрэглэгчийн нүүр хуудас дээр цас бурхах харагдуулах</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSnowEffect(!snowEffect)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${snowEffect ? 'bg-blue-500' : 'bg-muted'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${snowEffect ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Logo Upload Card */}
                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-5 py-4 gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-24 h-10 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
                            {logoUrl
                                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={logoUrl} alt="Site Logo" className="h-full w-auto object-contain" />
                                : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Сайтын Навбарын Лого</p>
                            <p className="text-xs text-muted-foreground">Хэрэглэгчийн сайтын дээд хэсэгт харагдах лого зургийг сольж болно</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {logoUrl && (
                            <button
                                type="button"
                                onClick={() => setLogoUrl("")}
                                className="text-xs text-red-500 hover:underline"
                            >Устгах</button>
                        )}
                        <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-background px-3 py-2 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
                        >
                            <UploadCloud className="w-3.5 h-3.5" />
                            {isUploadingLogo ? "Хуулж байна..." : "Лого солих"}
                        </button>
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Header Nav Setup */}
                    <div className="space-y-4 border border-border/50 p-4 rounded-lg bg-muted/10">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Дээд цэс (Nav)</h3>
                            <button
                                onClick={() => setHeaderNav([...headerNav, { label: "", href: "" }])}
                                className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20"
                            >
                                + Цэс нэмэх
                            </button>
                        </div>
                        {headerNav.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Цэс алга байна.</p>}
                        <div className="space-y-3">
                            {headerNav.map((nav, i) => (
                                <div key={i} className="flex gap-2 items-start bg-background p-3 rounded border border-border/50 shadow-sm relative group">
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Нэр</label>
                                            <input
                                                value={nav.label}
                                                onChange={(e) => {
                                                    const newNav = [...headerNav];
                                                    newNav[i].label = e.target.value;
                                                    setHeaderNav(newNav);
                                                }}
                                                placeholder="Цэсний нэр (Жнь: Студио)"
                                                className="w-full text-sm bg-transparent border-b border-border/50 pb-1 focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Линк</label>
                                            <input
                                                value={nav.href}
                                                onChange={(e) => {
                                                    const newNav = [...headerNav];
                                                    newNav[i].href = e.target.value;
                                                    setHeaderNav(newNav);
                                                }}
                                                placeholder="Холбоос (Жнь: /studios)"
                                                className="w-full text-sm bg-transparent border-b border-border/50 pb-1 focus:outline-none focus:border-primary text-blue-400"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setHeaderNav(headerNav.filter((_, index) => index !== i))}
                                        className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Home Cards Setup */}
                    <div className="space-y-4 border border-border/50 p-4 rounded-lg bg-muted/10">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Доод Картууд</h3>
                            <button
                                onClick={() => setHomeCards([...homeCards, { label: "", desc: "", href: "", icon: "Camera" }])}
                                className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20"
                            >
                                + Карт нэмэх
                            </button>
                        </div>
                        {homeCards.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Карт алга байна.</p>}
                        <div className="space-y-3">
                            {homeCards.map((card, i) => (
                                <div key={i} className="flex gap-2 items-start bg-background p-3 rounded border border-border/50 shadow-sm">
                                    <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Нэр</label>
                                                <input
                                                    value={card.label}
                                                    onChange={(e) => {
                                                        const newCards = [...homeCards];
                                                        newCards[i].label = e.target.value;
                                                        setHomeCards(newCards);
                                                    }}
                                                    placeholder="Студио"
                                                    className="w-full text-sm bg-transparent border-b border-border/50 pb-1 focus:outline-none focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Айкон нэр</label>
                                                <select
                                                    value={card.icon}
                                                    onChange={(e) => {
                                                        const newCards = [...homeCards];
                                                        newCards[i].icon = e.target.value;
                                                        setHomeCards(newCards);
                                                    }}
                                                    className="w-full text-sm bg-background border-b border-border/50 pb-1 focus:outline-none focus:border-primary text-gray-300"
                                                >
                                                    <option value="Camera">Camera</option>
                                                    <option value="Radio">Radio (Шууд дамжуулалт)</option>
                                                    <option value="Image">Image (Гэрэл зураг)</option>
                                                    <option value="Film">Film (Видео)</option>
                                                    <option value="Package">Package (Багц)</option>
                                                    <option value="Mic">Mic (Дуу)</option>
                                                    <option value="MonitorPlay">MonitorPlay</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Тайлбар</label>
                                            <input
                                                value={card.desc}
                                                onChange={(e) => {
                                                    const newCards = [...homeCards];
                                                    newCards[i].desc = e.target.value;
                                                    setHomeCards(newCards);
                                                }}
                                                placeholder="Мэргэжлийн зураг авалт"
                                                className="w-full text-sm bg-transparent border-b border-border/50 pb-1 focus:outline-none focus:border-primary text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Линк</label>
                                            <input
                                                value={card.href}
                                                onChange={(e) => {
                                                    const newCards = [...homeCards];
                                                    newCards[i].href = e.target.value;
                                                    setHomeCards(newCards);
                                                }}
                                                placeholder="/studios"
                                                className="w-full text-sm bg-transparent border-b border-border/50 pb-1 focus:outline-none focus:border-primary text-blue-400"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setHomeCards(homeCards.filter((_, index) => index !== i))}
                                        className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors h-8 w-8 flex items-center justify-center shrink-0 mt-4"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 mt-8">
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
                                        <label className="text-xs text-gray-400 block">Гарчиг (Эхний хэсэг)</label>
                                        <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Мэргэжлийн студио" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
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
                                        <label className="text-xs text-gray-400 block">Захиалах товч — хаашаа чиглүүлэх</label>
                                        <select
                                            value={formData.buttonLink}
                                            onChange={e => setFormData({ ...formData, buttonLink: e.target.value })}
                                            className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                        >
                                            <option value="/studios">Студио</option>
                                            <option value="/photographers">Зурагчин</option>
                                            <option value="/video-editing">Эдит</option>
                                            <option value="/livestream">Шууд дамжуулалт</option>
                                            <option value="/bundles">Багц үйлчилгээ</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 block">Дараалал (Order)</label>
                                        <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                </div>
                                <div className="flex items-center pt-1">
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                        <input type="checkbox" className="accent-primary" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                        Идэвхтэй харуулах
                                    </label>
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
