"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, Image as ImageIcon, Camera } from "lucide-react";
import { toast } from "sonner";
import * as Tabs from '@radix-ui/react-tabs';
import { getToken } from "@/lib/auth";

interface CameraTier {
    id?: number;
    cameraCount: number;
    label: string;
    price: string;
}

export default function LivePage() {
    const [loading, setLoading] = useState(true);

    // --- CATEGORY STATE ---
    const [categories, setCategories] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
    const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "" });

    // --- LIVE SERVICE STATE ---
    const [liveServices, setLiveServices] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
    const [equipments, setEquipments] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isSavingService, setIsSavingService] = useState(false);
    const [editingService, setEditingService] = useState<any | null /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
    const [serviceFormData, setServiceFormData] = useState({
        name: "", categoryId: "", description: "", image: "", isActive: true,
        equipmentIds: [] as number[],
        priceTiers: [] as CameraTier[],
        amenities: [] as string[],
    });

    // Image Upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const fetchData = async () => {
        try {
            const [resCategories, resServices, resEquipments] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/categories`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/live-services`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/equipment`),
            ]);
            if (resCategories.ok) setCategories(await resCategories.json());
            if (resServices.ok) setLiveServices(await resServices.json());
            if (resEquipments.ok) setEquipments(await resEquipments.json());
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingImage(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload`, { method: 'POST', headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) }, body: fd });
            if (res.ok) {
                const data = await res.json();
                setServiceFormData(prev => ({ ...prev, image: data.url }));
                toast.success("Зураг амжилттай хуулагдлаа!");
            } else { toast.error("Зураг хуулахад алдаа гарлаа."); }
        } catch { toast.error("Сервертэй холбогдоход алдаа гарлаа."); }
        finally { setIsUploadingImage(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    // ==========================================
    // CATEGORY ACTIONS
    // ==========================================
    const handleOpenCategoryModal = (cat: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = null) => {
        if (cat) { setEditingCategory(cat); setCategoryFormData({ name: cat.name, description: cat.description || "" }); }
        else { setEditingCategory(null); setCategoryFormData({ name: "", description: "" }); }
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingCategory(true);
        try {
            const method = editingCategory ? 'PATCH' : 'POST';
            const url = editingCategory ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`}/categories/${editingCategory.id}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/categories`;
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryFormData) });
            if (res.ok) { await fetchData(); setIsCategoryModalOpen(false); toast.success("Ангилал хадгалагдлаа"); }
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Сервертэй алдаа гарав."); }
        finally { setIsSavingCategory(false); }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`}/categories/${id}`, { method: 'DELETE' });
            if (res.ok) { setCategories(categories.filter(c => c.id !== id)); toast.success("Ангилал устгагдлаа"); }
            else toast.error("Алдаа гарлаа.");
        } catch { toast.error("Сервертэй холбогдоход алдаа гарлаа."); }
    };

    // ==========================================
    // LIVE SERVICE ACTIONS
    // ==========================================
    const blankService = () => ({
        name: "", categoryId: categories[0]?.id?.toString() || "", description: "", image: "", isActive: true,
        equipmentIds: [] as number[],
        priceTiers: [{ cameraCount: 1, label: "1 камер", price: "" }] as CameraTier[],
        amenities: [] as string[],
    });

    const handleOpenServiceModal = (svc: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = null) => {
        if (svc) {
            setEditingService(svc);
            setServiceFormData({
                name: svc.name, categoryId: svc.categoryId?.toString() || "", description: svc.description || "",
                image: svc.image || "", isActive: svc.isActive ?? true,
                amenities: svc.amenities || [],
                equipmentIds: svc.equipments?.map((e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => e.equipmentId) || [],
                priceTiers: svc.priceTiers?.length
                    ? svc.priceTiers.map((t: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({ id: t.id, cameraCount: t.cameraCount, label: t.label || `${t.cameraCount} камер`, price: t.price?.toString() || "" }))
                    : [{ cameraCount: 1, label: "1 камер", price: "" }],
            });
        } else {
            setEditingService(null);
            setServiceFormData(blankService());
        }
        setIsServiceModalOpen(true);
    };

    const addTier = () => {
        setServiceFormData(prev => {
            const nextCount = (prev.priceTiers[prev.priceTiers.length - 1]?.cameraCount || 0) + 1;
            return { ...prev, priceTiers: [...prev.priceTiers, { cameraCount: nextCount, label: `${nextCount} камер`, price: "" }] };
        });
    };

    const removeTier = (idx: number) => {
        setServiceFormData(prev => ({ ...prev, priceTiers: prev.priceTiers.filter((_, i) => i !== idx) }));
    };

    const updateTier = (idx: number, field: keyof CameraTier, value: string | number) => {
        setServiceFormData(prev => {
            const tiers = [...prev.priceTiers];
            tiers[idx] = { ...tiers[idx], [field]: value };
            return { ...prev, priceTiers: tiers };
        });
    };

    const toggleEquipment = (eqId: number) => {
        setServiceFormData(prev => {
            const ids = prev.equipmentIds;
            return { ...prev, equipmentIds: ids.includes(eqId) ? ids.filter(id => id !== eqId) : [...ids, eqId] };
        });
    };

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceFormData.categoryId) { toast.error("Ангилал сонгоно уу!"); return; }
        if (serviceFormData.priceTiers.length === 0) { toast.error("Дор хаяж нэг үнийн мэдээлэл оруулна уу!"); return; }
        if (serviceFormData.priceTiers.some(t => !t.price || isNaN(parseFloat(t.price)))) { toast.error("Үнийн мэдээлэл бүгд зөв байна уу?"); return; }

        setIsSavingService(true);
        try {
            const method = editingService ? 'PATCH' : 'POST';
            const url = editingService ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`}/live-services/${editingService.id}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/live-services`;

            const payload = {
                name: serviceFormData.name,
                categoryId: parseInt(serviceFormData.categoryId),
                description: serviceFormData.description || undefined,
                image: serviceFormData.image || undefined,
                isActive: serviceFormData.isActive,
                equipmentIds: serviceFormData.equipmentIds,
                amenities: serviceFormData.amenities,
                priceTiers: serviceFormData.priceTiers.map(t => ({
                    cameraCount: Number(t.cameraCount),
                    label: t.label || `${t.cameraCount} камер`,
                    price: parseFloat(t.price),
                })),
            };

            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) { await fetchData(); setIsServiceModalOpen(false); toast.success("Үйлчилгээ хадгалагдлаа"); }
            else { const err = await res.json().catch(() => ({})); toast.error(err?.message || "Алдаа гарлаа"); }
        } catch { toast.error("Сервертэй алдаа гарав."); }
        finally { setIsSavingService(false); }
    };

    const handleDeleteService = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`}/live-services/${id}`, { method: 'DELETE' });
            if (res.ok) { setLiveServices(liveServices.filter(s => s.id !== id)); toast.success("Устгагдлаа"); }
            else toast.error("Алдаа гарлаа.");
        } catch { toast.error("Сервертэй холбогдоход алдаа гарлаа."); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Шууд дамжуулалт</h1>
                <p className="text-muted-foreground mt-1">Шууд дамжуулалтын үйлчилгээ болон ангиллыг удирдах хэсэг.</p>
            </div>

            <Tabs.Root defaultValue="services" className="flex flex-col w-full">
                <Tabs.List className="flex shrink-0 border-b border-border/50 bg-background" aria-label="Management Tabs">
                    <Tabs.Trigger value="services" className="px-5 h-[45px] flex items-center justify-center text-sm font-medium leading-none text-muted-foreground select-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary outline-none cursor-pointer transition-colors">
                        Шууд дамжуулалт
                    </Tabs.Trigger>
                    <Tabs.Trigger value="categories" className="px-5 h-[45px] flex items-center justify-center text-sm font-medium leading-none text-muted-foreground select-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary outline-none cursor-pointer transition-colors">
                        Ангилал
                    </Tabs.Trigger>
                </Tabs.List>

                {/* ===================================== */}
                {/* LIVE SERVICE TAB */}
                {/* ===================================== */}
                <Tabs.Content value="services" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Шууд дамжуулалтын үйлчилгээ</h2>
                        <button onClick={() => handleOpenServiceModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Үйлчилгээ нэмэх
                        </button>
                    </div>

                    <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium border-b w-[80px]">Зураг</th>
                                    <th className="px-6 py-4 font-medium border-b">Нэр</th>
                                    <th className="px-6 py-4 font-medium border-b">Ангилал</th>
                                    <th className="px-6 py-4 font-medium border-b">Камерийн үнэ</th>
                                    <th className="px-6 py-4 font-medium border-b w-[100px]">Төлөв</th>
                                    <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : liveServices.length === 0 ? (<tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Бүртгэл алга байна.</td></tr>)
                                        : liveServices.map((s) => (
                                            <tr key={s.id} className="hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    {s.image ? (
                                                        <div className="w-10 h-10 rounded overflow-hidden">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><Camera className="w-4 h-4 text-muted-foreground" /></div>}
                                                </td>
                                                <td className="px-6 py-4 font-medium">{s.name}</td>
                                                <td className="px-6 py-4">{s.category?.name || "—"}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        {s.priceTiers?.map((t: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                                                            <span key={t.id} className="text-xs text-muted-foreground">
                                                                {t.label || `${t.cameraCount} камер`}: <span className="text-foreground font-medium">{Number(t.price).toLocaleString()} ₮</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs rounded-full ${s.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{s.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}</span></td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => handleOpenServiceModal(s)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteService(s.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                </Tabs.Content>

                {/* ===================================== */}
                {/* CATEGORY TAB */}
                {/* ===================================== */}
                <Tabs.Content value="categories" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Үйлчилгээний Ангилал</h2>
                        <button onClick={() => handleOpenCategoryModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Ангилал үүсгэх
                        </button>
                    </div>

                    <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium border-b w-[80px]">ID</th>
                                    <th className="px-6 py-4 font-medium border-b">Нэр</th>
                                    <th className="px-6 py-4 font-medium border-b">Тайлбар</th>
                                    <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : categories.length === 0 ? (<tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Бүртгэл алга байна.</td></tr>)
                                        : categories.map((c) => (
                                            <tr key={c.id} className="hover:bg-muted/30">
                                                <td className="px-6 py-4 text-muted-foreground">{c.id}</td>
                                                <td className="px-6 py-4 font-medium">{c.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{c.description || '—'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => handleOpenCategoryModal(c)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteCategory(c.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                </Tabs.Content>
            </Tabs.Root>

            {/* Hidden file input */}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

            {/* ===================================== */}
            {/* CATEGORY MODAL */}
            {/* ===================================== */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !isSavingCategory && setIsCategoryModalOpen(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingCategory ? 'Ангилал засах' : 'Ангилал үүсгэх'}</h2>
                            <button onClick={() => !isSavingCategory && setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="category-form" onSubmit={handleSaveCategory} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Нэр <span className="text-red-500">*</span></label>
                                    <input required value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Тайлбар</label>
                                    <textarea value={categoryFormData.description} onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]" />
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Болих</button>
                            <button type="submit" form="category-form" disabled={isSavingCategory} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">{isSavingCategory ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================== */}
            {/* LIVE SERVICE MODAL */}
            {/* ===================================== */}
            {isServiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !isSavingService && setIsServiceModalOpen(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingService ? 'Үйлчилгээ засах' : 'Шинэ үйлчилгээ нэмэх'}</h2>
                            <button onClick={() => !isSavingService && setIsServiceModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="service-form" onSubmit={handleSaveService} className="space-y-5">
                                {/* Image */}
                                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-lg border border-white/5">
                                    <div className="w-16 h-16 rounded overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {serviceFormData.image ? <img src={serviceFormData.image} alt="" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-gray-500" />}
                                    </div>
                                    <button type="button" disabled={isUploadingImage} onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm bg-black/20 border border-white/10 hover:bg-white/5 transition-colors rounded-md text-gray-200">
                                        {isUploadingImage ? <span className="animate-pulse">Хуулж байна...</span> : "Зураг хуулах"}
                                    </button>
                                </div>

                                {/* Basic fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-xs text-gray-400">Ангилал <span className="text-red-500">*</span></label>
                                        <select required value={serviceFormData.categoryId} onChange={e => setServiceFormData({ ...serviceFormData, categoryId: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                                            <option value="" disabled className="bg-[#1e1e1e]">Сонгох...</option>
                                            {categories.map(c => <option key={c.id} value={c.id} className="bg-[#1e1e1e]">{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-xs text-gray-400">Үйлчилгээний нэр <span className="text-red-500">*</span></label>
                                        <input required value={serviceFormData.name} onChange={e => setServiceFormData({ ...serviceFormData, name: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Шууд дамжуулалтын үйлчилгээ..." />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Тайлбар</label>
                                    <textarea value={serviceFormData.description} onChange={e => setServiceFormData({ ...serviceFormData, description: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]" placeholder="Үйлчилгээний тайлбар..." />
                                </div>

                                {/* Features / Amenities */}
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 block">Онцлог талууд (Features)</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Шинэ онцлог..."
                                            className="flex-1 bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                            id="new-amenity-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = (e.target as HTMLInputElement).value.trim();
                                                    if (val && !serviceFormData.amenities.includes(val)) {
                                                        setServiceFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('new-amenity-input') as HTMLInputElement;
                                                const val = input.value.trim();
                                                if (val && !serviceFormData.amenities.includes(val)) {
                                                    setServiceFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
                                                    input.value = '';
                                                }
                                            }}
                                            className="px-3 py-2 bg-white/10 text-gray-200 rounded-md text-sm hover:bg-white/20 transition-colors border border-white/5 shrink-0"
                                        >
                                            Нэмэх
                                        </button>
                                    </div>
                                    {serviceFormData.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-3 bg-black/10 border border-white/5 rounded-md">
                                            {serviceFormData.amenities.map(amenity => (
                                                <span key={amenity} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-black/20 border border-white/10 text-gray-200 rounded-full">
                                                    {amenity}
                                                    <button
                                                        type="button"
                                                        className="text-gray-500 hover:text-red-500 transition-colors p-0.5"
                                                        onClick={() => setServiceFormData(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }))}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Camera Price Tiers */}
                                <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs text-gray-400">Камерийн тоогоор үнэ <span className="text-red-500">*</span></label>
                                        <button type="button" onClick={addTier} className="text-[10px] flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition-colors">
                                            <Plus className="w-3 h-3" /> нэмэх
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {serviceFormData.priceTiers.map((tier, idx) => (
                                            <div key={idx} className="grid grid-cols-[80px_1fr_1fr_32px] gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1 block">Камер</label>
                                                    <input
                                                        type="number" min={1} value={tier.cameraCount}
                                                        onChange={e => updateTier(idx, 'cameraCount', parseInt(e.target.value))}
                                                        className="w-full bg-white/5 border border-white/5 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary text-center"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1 block">Нэршил</label>
                                                    <input
                                                        type="text" value={tier.label}
                                                        onChange={e => updateTier(idx, 'label', e.target.value)}
                                                        placeholder={`${tier.cameraCount} камер`}
                                                        className="w-full bg-white/5 border border-white/5 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1 block">Үнэ (₮)</label>
                                                    <input
                                                        type="number" min={0} value={tier.price}
                                                        onChange={e => updateTier(idx, 'price', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/5 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                                                        required
                                                    />
                                                </div>
                                                <button type="button" onClick={() => removeTier(idx)} disabled={serviceFormData.priceTiers.length <= 1} className="mt-4 text-gray-500 hover:text-red-500 disabled:opacity-30 flex justify-center">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Equipment selection */}
                                {equipments.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 block">Дагалдах тоног төхөөрөмж</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-white/5 rounded-md bg-black/10">
                                            {equipments.map(eq => (
                                                <label key={eq.id} className="flex items-center gap-2 text-sm p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors text-gray-300">
                                                    <input type="checkbox" checked={serviceFormData.equipmentIds.includes(eq.id)} onChange={() => toggleEquipment(eq.id)} className="accent-primary" />
                                                    <span className="truncate">{eq.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <label className="flex items-center gap-2 text-xs text-gray-300">
                                    <input type="checkbox" checked={serviceFormData.isActive} onChange={e => setServiceFormData({ ...serviceFormData, isActive: e.target.checked })} className="accent-primary" />
                                    Идэвхтэй
                                </label>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Болих</button>
                            <button type="submit" form="service-form" disabled={isSavingService} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">{isSavingService ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
