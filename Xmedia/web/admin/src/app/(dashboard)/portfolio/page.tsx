"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, ImageIcon, Eye, EyeOff, Youtube, Facebook } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/auth";

type ServiceType = "STUDIO" | "LIVE" | "PHOTOGRAPHER" | "PHOTO_EDIT" | "VIDEO_EDIT";

interface PortfolioItem {
    id: number;
    serviceType: ServiceType;
    title: string;
    description?: string;
    images: string[];
    tags?: string[];
    isPublished: boolean;
    sortOrder: number;
    // LIVE-specific
    liveDate?: string;
    viewCount?: number;
    youtubeUrl?: string;
    facebookUrl?: string;
    createdAt: string;
}

const TABS: { key: ServiceType; label: string }[] = [
    { key: "STUDIO", label: "Студио" },
    { key: "LIVE", label: "Шууд дамжуулалт" },
    { key: "PHOTOGRAPHER", label: "Зураглаач" },
    { key: "PHOTO_EDIT", label: "Зураг эдит" },
    { key: "VIDEO_EDIT", label: "Видео эдит" },
];

const EMPTY_GENERIC = { title: "", description: "", images: [] as string[], tags: [] as string[], isPublished: true, sortOrder: 0, youtubeUrl: "", facebookUrl: "" };
const EMPTY_LIVE = { title: "", description: "", image: "", viewCount: 0, liveDate: "", youtubeUrl: "", facebookUrl: "", isPublished: true };

export default function PortfolioPage() {
    const [activeTab, setActiveTab] = useState<ServiceType>("STUDIO");
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModal, setIsModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<PortfolioItem | null>(null);

    // Generic form
    const [genericForm, setGenericForm] = useState({ ...EMPTY_GENERIC });
    const [newTag, setNewTag] = useState("");
    const [newImageUrl, setNewImageUrl] = useState("");

    // LIVE form
    const [liveForm, setLiveForm] = useState({ ...EMPTY_LIVE });

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const liveFileRef = useRef<HTMLInputElement>(null);

    const fetchItems = async (tab: ServiceType) => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`/portfolio?serviceType=${tab}`);
            if (res.ok) setItems(await res.json());
        } catch { toast.error("Өгөгдөл унших алдаа."); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(activeTab); }, [activeTab]);

    const openModal = (item: PortfolioItem | null = null) => {
        setEditing(item);
        if (activeTab === "LIVE") {
            setLiveForm(item ? {
                title: item.title,
                description: item.description ?? "",
                image: Array.isArray(item.images) && item.images[0] ? item.images[0] : "",
                viewCount: item.viewCount ?? 0,
                liveDate: item.liveDate ? item.liveDate.slice(0, 10) : "",
                youtubeUrl: item.youtubeUrl ?? "",
                facebookUrl: item.facebookUrl ?? "",
                isPublished: item.isPublished,
            } : { ...EMPTY_LIVE });
        } else {
            setGenericForm(item ? {
                title: item.title,
                description: item.description ?? "",
                images: Array.isArray(item.images) ? item.images : [],
                tags: Array.isArray(item.tags) ? item.tags : [],
                isPublished: item.isPublished,
                sortOrder: item.sortOrder,
                youtubeUrl: item.youtubeUrl ?? "",
                facebookUrl: item.facebookUrl ?? "",
            } : { ...EMPTY_GENERIC });
            setNewTag("");
            setNewImageUrl("");
        }
        setIsModal(true);
    };

    // --- Generic helpers ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLive = false) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        const uploadedUrls: string[] = [];
        for (const file of Array.from(files)) {
            const fd = new FormData();
            fd.append("file", file);
            try {
                const res = await fetchWithAuth("/upload", { method: "POST", body: fd });
                if (res.ok) {
                    const d = await res.json();
                    uploadedUrls.push(d.url ?? d.path ?? d.filename ?? "");
                }
            } catch { toast.error("Upload алдаа."); }
        }
        if (isLive) {
            setLiveForm(prev => ({ ...prev, image: uploadedUrls[0] ?? prev.image }));
        } else {
            setGenericForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls.filter(Boolean)] }));
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (liveFileRef.current) liveFileRef.current.value = "";
    };

    const addImageUrl = () => {
        if (!newImageUrl.trim()) return;
        setGenericForm(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
        setNewImageUrl("");
    };

    const removeImage = (idx: number) =>
        setGenericForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

    const addTag = () => {
        const t = newTag.trim();
        if (!t || genericForm.tags.includes(t)) return;
        setGenericForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
        setNewTag("");
    };
    const removeTag = (idx: number) =>
        setGenericForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let payload: Record<string, unknown>;
        if (activeTab === "LIVE") {
            if (!liveForm.title.trim()) { toast.error("Нэр оруулна уу!"); setSaving(false); return; }
            payload = {
                serviceType: "LIVE",
                title: liveForm.title.trim(),
                description: liveForm.description.trim() || undefined,
                images: liveForm.image ? [liveForm.image] : [],
                isPublished: liveForm.isPublished,
                viewCount: liveForm.viewCount || 0,
                liveDate: liveForm.liveDate ? new Date(liveForm.liveDate).toISOString() : undefined,
                youtubeUrl: liveForm.youtubeUrl.trim() || undefined,
                facebookUrl: liveForm.facebookUrl.trim() || undefined,
            };
        } else {
            if (!genericForm.title.trim()) { toast.error("Гарчиг оруулна уу!"); setSaving(false); return; }
            if (genericForm.images.length === 0) { toast.error("Дор хаяж нэг зураг оруулна уу!"); setSaving(false); return; }
            payload = {
                serviceType: activeTab,
                title: genericForm.title.trim(),
                description: genericForm.description.trim() || undefined,
                images: genericForm.images,
                tags: genericForm.tags.length > 0 ? genericForm.tags : undefined,
                isPublished: genericForm.isPublished,
                sortOrder: genericForm.sortOrder,
                ...(activeTab === "VIDEO_EDIT" ? {
                    youtubeUrl: genericForm.youtubeUrl.trim() || undefined,
                    facebookUrl: genericForm.facebookUrl.trim() || undefined,
                } : {}),
            };
        }

        const res = await fetchWithAuth(editing ? `/portfolio/${editing.id}` : "/portfolio", {
            method: editing ? "PATCH" : "POST",
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            await fetchItems(activeTab);
            setIsModal(false);
            toast.success(editing ? "Амжилттай шинэчлэгдлэ!" : "Амжилттай нэмэгдлэ!");
        } else {
            const err = await res.json().catch(() => ({}));
            toast.error(err?.message || "Алдаа гарлаа");
        }
        setSaving(false);
    };

    const remove = async (item: PortfolioItem) => {
        if (!confirm(`"${item.title}" устгахдаа итгэлтэй байна уу?`)) return;
        const res = await fetchWithAuth(`/portfolio/${item.id}`, { method: "DELETE" });
        if (res.ok) { setItems(p => p.filter(i => i.id !== item.id)); toast.success("Устгагдлаа."); }
        else toast.error("Устгах амжилтгүй.");
    };

    const togglePublish = async (item: PortfolioItem) => {
        const res = await fetchWithAuth(`/portfolio/${item.id}`, {
            method: "PATCH",
            body: JSON.stringify({ isPublished: !item.isPublished }),
        });
        if (res.ok) {
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPublished: !i.isPublished } : i));
            toast.success(item.isPublished ? "Нуугдлаа" : "Нийтлэгдлэ");
        }
    };

    const fmtNum = (n?: number) => n != null ? n.toLocaleString() : "—";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Өмнөх ажлууд</h1>
                    <p className="text-muted-foreground mt-1">5 үйлчилгээний portfolio болон өмнөх ажлуудыг удирдах.</p>
                </div>
                <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Ажил нэмэх
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-background overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/40 text-xs text-muted-foreground uppercase border-b border-border">
                        <tr>
                            <th className="px-4 py-3 w-16">Зураг</th>
                            <th className="px-4 py-3">Нэр</th>
                            {activeTab === "LIVE" ? (
                                <>
                                    <th className="px-4 py-3">Огноо</th>
                                    <th className="px-4 py-3">Үзэлт</th>
                                    <th className="px-4 py-3">Links</th>
                                </>
                            ) : activeTab === "VIDEO_EDIT" ? (
                                <>
                                    <th className="px-4 py-3">Тайлбар</th>
                                    <th className="px-4 py-3">Links</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-4 py-3">Тайлбар</th>
                                    <th className="px-4 py-3">Шошго</th>
                                </>
                            )}
                            <th className="px-4 py-3">Төлөв</th>
                            <th className="px-4 py-3">Огноо</th>
                            <th className="px-4 py-3 text-right">Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">Уншиж байна...</td></tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-16 text-center">
                                    <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                                    <p className="text-muted-foreground text-sm">Ажил байхгүй байна.</p>
                                    <button onClick={() => openModal()} className="mt-3 text-sm text-primary hover:underline inline-flex items-center gap-1">
                                        <Plus className="h-3.5 w-3.5" /> Ажил нэмэх
                                    </button>
                                </td>
                            </tr>
                        ) : items.map(item => {
                            const imgs = Array.isArray(item.images) ? item.images : [];
                            const tags = Array.isArray(item.tags) ? item.tags : [];
                            return (
                                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3">
                                        {imgs[0] ? (
                                            <img src={imgs[0]} alt={item.title} className="w-14 h-14 rounded-lg object-cover border border-border" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-lg border border-border bg-muted flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium max-w-[150px] truncate">{item.title}</td>
                                    {activeTab === "LIVE" ? (
                                        <>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                                {item.liveDate ? new Date(item.liveDate).toLocaleDateString("mn-MN") : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{fmtNum(item.viewCount)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    {item.youtubeUrl && (
                                                        <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600" title="YouTube">
                                                            <Youtube className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    {item.facebookUrl && (
                                                        <a href={item.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600" title="Facebook">
                                                            <Facebook className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    {!item.youtubeUrl && !item.facebookUrl && <span className="text-muted-foreground">—</span>}
                                                </div>
                                            </td>
                                        </>
                                    ) : activeTab === "VIDEO_EDIT" ? (
                                        <>
                                            <td className="px-4 py-3 text-muted-foreground max-w-[180px]">
                                                <p className="truncate">{item.description || "—"}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    {item.youtubeUrl && (
                                                        <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600" title="YouTube">
                                                            <Youtube className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    {item.facebookUrl && (
                                                        <a href={item.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600" title="Facebook">
                                                            <Facebook className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    {!item.youtubeUrl && !item.facebookUrl && <span className="text-muted-foreground">—</span>}
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 text-muted-foreground max-w-[180px]">
                                                <p className="truncate">{item.description || "—"}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {tags.length > 0 ? tags.map((t, i) => (
                                                        <span key={i} className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{t}</span>
                                                    )) : <span className="text-muted-foreground">—</span>}
                                                </div>
                                            </td>
                                        </>
                                    )}
                                    <td className="px-4 py-3">
                                        <button onClick={() => togglePublish(item)}>
                                            {item.isPublished ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium">
                                                    <Eye className="h-3 w-3" /> Нийтлэгдсэн
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground border border-border px-2 py-0.5 text-[10px] font-medium">
                                                    <EyeOff className="h-3 w-3" /> Нуугдсан
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                        {new Date(item.createdAt).toLocaleDateString("mn-MN")}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openModal(item)} className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => remove(item)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                    Нийт {items.length} ажил
                </div>
            </div>

            {/* Modal */}
            {isModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setIsModal(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">
                                {editing ? "Засах" : "Шинэ ажил"} — {TABS.find(t => t.key === activeTab)?.label}
                            </h2>
                            <button onClick={() => !saving && setIsModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <form id="portfolio-form" onSubmit={save} className="space-y-5">
                                {activeTab === "LIVE" ? (
                                    // --- LIVE FORM ---
                                    <>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Нэр <span className="text-red-500">*</span></label>
                                            <input required value={liveForm.title} onChange={e => setLiveForm({ ...liveForm, title: e.target.value })}
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Шууд дамжуулалтын нэр" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Огноо</label>
                                            <input type="date" value={liveForm.liveDate} onChange={e => setLiveForm({ ...liveForm, liveDate: e.target.value })}
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Тайлбар</label>
                                            <textarea value={liveForm.description} onChange={e => setLiveForm({ ...liveForm, description: e.target.value })}
                                                rows={3} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none"
                                                placeholder="Дамжуулалтын тухай товч тайлбар..." />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Үзсэн үзэлт</label>
                                            <input type="number" min={0} value={liveForm.viewCount} onChange={e => setLiveForm({ ...liveForm, viewCount: +e.target.value })}
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                placeholder="0" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500 block">Зураг</label>
                                            {liveForm.image && (
                                                <div className="relative inline-block">
                                                    <img src={liveForm.image} alt="" className="h-24 rounded-lg object-cover border border-white/10" />
                                                    <button type="button" onClick={() => setLiveForm({ ...liveForm, image: "" })}
                                                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-white flex items-center justify-center">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <input ref={liveFileRef} type="file" accept="image/*" onChange={e => handleFileUpload(e, true)} className="hidden" />
                                                <button type="button" onClick={() => liveFileRef.current?.click()} disabled={uploading}
                                                    className="px-3 py-2 text-xs rounded-md border border-dashed border-white/20 bg-black/20 hover:bg-white/5 text-gray-300 transition-colors disabled:opacity-50">
                                                    {uploading ? "Хуулж байна..." : "Файл оруулах"}
                                                </button>
                                            </div>
                                            <input type="url" value={liveForm.image} onChange={e => setLiveForm({ ...liveForm, image: e.target.value })}
                                                placeholder="Эсвэл зургийн URL..."
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 flex items-center gap-1.5 block"><Youtube className="h-4 w-4 text-red-500" /> YouTube Link</label>
                                            <input type="url" value={liveForm.youtubeUrl} onChange={e => setLiveForm({ ...liveForm, youtubeUrl: e.target.value })}
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                placeholder="https://youtube.com/watch?v=..." />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 flex items-center gap-1.5 block"><Facebook className="h-4 w-4 text-blue-500" /> Facebook Link</label>
                                            <input type="url" value={liveForm.facebookUrl} onChange={e => setLiveForm({ ...liveForm, facebookUrl: e.target.value })}
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                placeholder="https://facebook.com/video/..." />
                                        </div>
                                    </>
                                ) : (
                                    // --- GENERIC FORM (Studio, Photographer, Edit) ---
                                    <>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Гарчиг <span className="text-red-500">*</span></label>
                                            <input required value={genericForm.title} onChange={e => setGenericForm({ ...genericForm, title: e.target.value })}
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Ажлын гарчиг..." />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Тайлбар</label>
                                            <textarea value={genericForm.description} onChange={e => setGenericForm({ ...genericForm, description: e.target.value })}
                                                rows={3} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none"
                                                placeholder="Ажлын тайлбар..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500 block">Зурагнууд <span className="text-red-500">*</span></label>
                                            {genericForm.images.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {genericForm.images.map((url, i) => (
                                                        <div key={i} className="relative group">
                                                            <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover border border-white/10" />
                                                            <button type="button" onClick={() => removeImage(i)}
                                                                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-white flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleFileUpload(e)} className="hidden" />
                                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                                    className="px-3 py-2 text-xs rounded-md border border-dashed border-white/20 bg-black/20 hover:bg-white/5 text-gray-300 transition-colors disabled:opacity-50">
                                                    {uploading ? "Хуулж байна..." : "Файл оруулах"}
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                                                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                                                    placeholder="Эсвэл URL оруулах..."
                                                    className="flex-1 bg-black/20 border border-white/5 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors" />
                                                <button type="button" onClick={addImageUrl} className="px-3 py-2 text-xs rounded-md border border-white/10 hover:bg-white/5 text-gray-300 transition-colors">Нэмэх</button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500 block">Шошго</label>
                                            {genericForm.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {genericForm.tags.map((t, i) => (
                                                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary px-2.5 py-1 text-xs font-medium">
                                                            {t} <button type="button" onClick={() => removeTag(i)} className="hover:text-red-400 ml-1 transition-colors"><X className="h-3 w-3" /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)}
                                                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                                                    placeholder="Шошго нэмэх..."
                                                    className="flex-1 bg-black/20 border border-white/5 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors" />
                                                <button type="button" onClick={addTag} className="px-3 py-2 text-xs rounded-md border border-white/10 hover:bg-white/5 text-gray-300 transition-colors">Нэмэх</button>
                                            </div>
                                        </div>
                                        {activeTab === "VIDEO_EDIT" && (
                                            <>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 flex items-center gap-1.5 block"><Youtube className="h-4 w-4 text-red-500" /> YouTube Link</label>
                                                    <input type="url" value={genericForm.youtubeUrl} onChange={e => setGenericForm({ ...genericForm, youtubeUrl: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                        placeholder="https://youtube.com/watch?v=..." />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 mb-1 flex items-center gap-1.5 block"><Facebook className="h-4 w-4 text-blue-500" /> Facebook Link</label>
                                                    <input type="url" value={genericForm.facebookUrl} onChange={e => setGenericForm({ ...genericForm, facebookUrl: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                        placeholder="https://facebook.com/video/..." />
                                                </div>
                                            </>
                                        )}
                                        <div className="flex items-center gap-5 pt-2">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">Эрэмбэ</label>
                                                <input type="number" value={genericForm.sortOrder} onChange={e => setGenericForm({ ...genericForm, sortOrder: +e.target.value })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 block">Нийтлэх</label>
                                                <button type="button" onClick={() => setGenericForm(p => ({ ...p, isPublished: !p.isPublished }))}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${genericForm.isPublished ? "bg-primary" : "bg-white/10"}`}>
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${genericForm.isPublished ? "translate-x-6" : "translate-x-1"}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>

                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                                Болих
                            </button>
                            <button type="submit" form="portfolio-form" disabled={saving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving ? <span className="animate-pulse">Түр хүлээнэ...</span> : "Хадгалах"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
