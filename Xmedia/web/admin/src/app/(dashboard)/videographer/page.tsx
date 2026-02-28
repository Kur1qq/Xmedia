"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import * as Tabs from '@radix-ui/react-tabs';
import { getToken } from "@/lib/auth";

export default function VideographerPage() {
    // Shared State
    const [loading, setLoading] = useState(true);

    // --- CATEGORY STATE ---
    const [categories, setCategories] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
    const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "" });

    // --- SERVICE STATE ---
    const [services, setServices] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isSavingService, setIsSavingService] = useState(false);
    const [editingService, setEditingService] = useState<any | null /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
    const [serviceFormData, setServiceFormData] = useState({
        name: "", categoryId: "", description: "", price: "", priceUnit: "1ш",
        durationMinutes: "", portfolioImages: "", isActive: true,
    });
    const priceUnits = ["1ш", "1 цаг", "1 өдөр", "1 төсөл"];

    // Shared Image Upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const fetchData = async () => {
        try {
            const [resCategories, resServices] = await Promise.all([
                fetch('http://localhost:4000/api/categories'),
                fetch('http://localhost:4000/api/services')
            ]);

            if (resCategories.ok) setCategories(await resCategories.json());
            if (resServices.ok) setServices(await resServices.json());
        } catch (error) {
            console.error("Error fetching data:", error);
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
            const res = await fetch('http://localhost:4000/api/upload', {
                method: 'POST',
                headers: {
                    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
                },
                body: uploadData,
            });

            if (res.ok) {
                const data = await res.json();
                setServiceFormData(prev => ({ ...prev, portfolioImages: data.url }));
                toast.success("Зураг амжилттай хуулагдлаа!");
            } else {
                toast.error("Зураг хуулахад алдаа гарлаа.");
            }
        } catch (error) {
            console.error("Image upload failed", error);
            toast.error("Сервертэй холбогдоход алдаа гарлаа.");
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ==========================================
    // CATEGORY ACTIONS
    // ==========================================
    const handleOpenCategoryModal = (cat: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = null) => {
        if (cat) {
            setEditingCategory(cat);
            setCategoryFormData({ name: cat.name, description: cat.description || "" });
        } else {
            setEditingCategory(null);
            setCategoryFormData({ name: "", description: "" });
        }
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingCategory(true);

        try {
            const method = editingCategory ? 'PATCH' : 'POST';
            const url = editingCategory ? `http://localhost:4000/api/categories/${editingCategory.id}` : 'http://localhost:4000/api/categories';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryFormData) });

            if (res.ok) {
                await fetchData();
                setIsCategoryModalOpen(false);
                toast.success("Ангилал амжилттай хадгалагдлаа");
            } else toast.error("Алдаа гарлаа");
        } catch (error) { toast.error("Сервертэй алдаа гарав."); }
        finally { setIsSavingCategory(false); }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        try {
            const res = await fetch(`http://localhost:4000/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) { setCategories(categories.filter(c => c.id !== id)); toast.success("Ангилал устгагдлаа"); }
            else toast.error("Алдаа гарлаа.");
        } catch (error) { toast.error("Сервертэй холбогдоход алдаа гарлаа."); }
    };


    // ==========================================
    // SERVICE ACTIONS
    // ==========================================
    const handleOpenServiceModal = (service: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = null) => {
        if (service) {
            setEditingService(service);
            setServiceFormData({
                name: service.name, categoryId: service.categoryId?.toString() || (categories[0]?.id?.toString() || ""),
                description: service.description || "", price: service.price || "", priceUnit: service.priceUnit || "1ш",
                durationMinutes: service.durationMinutes || "", portfolioImages: service.portfolioImages || "", isActive: service.isActive ?? true,
            });
        } else {
            setEditingService(null);
            setServiceFormData({
                name: "", categoryId: categories[0]?.id?.toString() || "", description: "", price: "", priceUnit: "1ш",
                durationMinutes: "", portfolioImages: "", isActive: true,
            });
        }
        setIsServiceModalOpen(true);
    };

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceFormData.categoryId) { toast.error("Ангилал сонгоно уу!"); return; }
        setIsSavingService(true);

        try {
            const method = editingService ? 'PATCH' : 'POST';
            const url = editingService ? `http://localhost:4000/api/services/${editingService.id}` : 'http://localhost:4000/api/services';

            const payload = {
                name: serviceFormData.name, categoryId: parseInt(serviceFormData.categoryId),
                description: serviceFormData.description || undefined, price: parseFloat(serviceFormData.price),
                priceUnit: serviceFormData.priceUnit,
                durationMinutes: serviceFormData.durationMinutes ? parseInt(serviceFormData.durationMinutes) : undefined,
                portfolioImages: serviceFormData.portfolioImages || undefined, isActive: serviceFormData.isActive,
            };

            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (res.ok) {
                await fetchData();
                setIsServiceModalOpen(false);
                toast.success("Үйлчилгээ амжилттай хадгалагдлаа");
            } else toast.error("Алдаа гарлаа");
        } catch (error) { toast.error("Сервертэй алдаа гарав."); }
        finally { setIsSavingService(false); }
    };

    const handleDeleteService = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        try {
            const res = await fetch(`http://localhost:4000/api/services/${id}`, { method: 'DELETE' });
            if (res.ok) { setServices(services.filter(s => s.id !== id)); toast.success("Үйлчилгээ устгагдлаа"); }
            else toast.error("Алдаа гарлаа.");
        } catch (error) { toast.error("Сервертэй холбогдоход алдаа гарлаа."); }
    };


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Видеограф</h1>
                <p className="text-muted-foreground mt-1">Видеограф үйлчилгээ болон ангиллыг удирдах хэсэг.</p>
            </div>

            <Tabs.Root defaultValue="categories" className="flex flex-col w-full">
                <Tabs.List className="flex shrink-0 border-b border-border/50 bg-background" aria-label="Management Tabs">
                    <Tabs.Trigger
                        value="categories"
                        className="px-5 h-[45px] flex items-center justify-center text-sm font-medium leading-none text-muted-foreground select-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary outline-none cursor-pointer transition-colors"
                    >
                        Ангилал
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="services"
                        className="px-5 h-[45px] flex items-center justify-center text-sm font-medium leading-none text-muted-foreground select-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary outline-none cursor-pointer transition-colors"
                    >
                        Үйлчилгээ
                    </Tabs.Trigger>
                </Tabs.List>

                {/* ===================================== */}
                {/* CATEGORY TAB CONTENT */}
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
                                    <th className="px-6 py-4 font-medium border-b w-[200px]">Нэр</th>
                                    <th className="px-6 py-4 font-medium border-b">Тайлбар</th>
                                    <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : categories.length === 0 ? (<tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Бүртгэл алга байна.</td></tr>)
                                        : categories.map((c) => (
                                            <tr key={c.id} className="hover:bg-muted/30">
                                                <td className="px-6 py-4 font-medium text-muted-foreground">{c.id}</td>
                                                <td className="px-6 py-4 font-medium">{c.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{c.description || '-'}</td>
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

                {/* ===================================== */}
                {/* SERVICE TAB CONTENT */}
                {/* ===================================== */}
                <Tabs.Content value="services" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Үйлчилгээнүүд</h2>
                        <button onClick={() => handleOpenServiceModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Үйлчилгээ нэмэх
                        </button>
                    </div>

                    <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium border-b w-[80px]">Зураг</th>
                                    <th className="px-6 py-4 font-medium border-b w-[200px]">Нэр</th>
                                    <th className="px-6 py-4 font-medium border-b">Ангилал</th>
                                    <th className="px-6 py-4 font-medium border-b">Үнэ</th>
                                    <th className="px-6 py-4 font-medium border-b w-[100px]">Төлөв</th>
                                    <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : services.length === 0 ? (<tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Бүртгэл алга байна.</td></tr>)
                                        : services.map((s) => (
                                            <tr key={s.id} className="hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    {s.portfolioImages ? (
                                                        <div className="w-10 h-10 rounded overflow-hidden"><img src={s.portfolioImages} alt={s.name} className="w-full h-full object-cover" /></div>
                                                    ) : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>}
                                                </td>
                                                <td className="px-6 py-4 font-medium">{s.name}</td>
                                                <td className="px-6 py-4">{s.category?.name || "Тодорхойгүй"}</td>
                                                <td className="px-6 py-4">{Number(s.price).toLocaleString()} ₮ <span className="text-muted-foreground text-xs">/ {s.priceUnit}</span></td>
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
            </Tabs.Root>

            {/* SHARED IMAGE INPUT (Hidden) */}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

            {/* ===================================== */}
            {/* CATEGORY MODAL */}
            {/* ===================================== */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-lg border border-border/50 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">{editingCategory ? 'Ангилал засах' : 'Ангилал үүсгэх'}</h2>
                            <button onClick={() => setIsCategoryModalOpen(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Нэр <span className="text-red-500">*</span></label>
                                <input required value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Тайлбар</label>
                                <textarea value={categoryFormData.description} onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })} className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px]" />
                            </div>
                            <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-sm">Болих</button><button type="submit" disabled={isSavingCategory} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">{isSavingCategory ? '...' : 'Хадгалах'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===================================== */}
            {/* SERVICE MODAL */}
            {/* ===================================== */}
            {isServiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border/50 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">{editingService ? 'Үйлчилгээ засах' : 'Шинэ үйлчилгээ нэмэх'}</h2>
                            <button onClick={() => setIsServiceModalOpen(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
                        </div>
                        <form onSubmit={handleSaveService} className="space-y-4">
                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                                <div className="w-16 h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
                                    {serviceFormData.portfolioImages ? <img src={serviceFormData.portfolioImages} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                                </div>
                                <button type="button" disabled={isUploadingImage} onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm bg-background border border-border/50 rounded-md hover:bg-muted">Видео/Зураг хуулах</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 col-span-2">
                                    <label className="text-sm font-medium">Ангилал <span className="text-red-500">*</span></label>
                                    <select required value={serviceFormData.categoryId} onChange={e => setServiceFormData({ ...serviceFormData, categoryId: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                        <option value="" disabled>Сонгох...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-sm font-medium">Нэр <span className="text-red-500">*</span></label>
                                    <input required value={serviceFormData.name} onChange={e => setServiceFormData({ ...serviceFormData, name: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Үнэ <span className="text-red-500">*</span></label>
                                    <input required type="number" value={serviceFormData.price} onChange={e => setServiceFormData({ ...serviceFormData, price: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Нэгж</label>
                                    <select value={serviceFormData.priceUnit} onChange={e => setServiceFormData({ ...serviceFormData, priceUnit: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                        {priceUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Тайлбар</label>
                                <textarea value={serviceFormData.description} onChange={e => setServiceFormData({ ...serviceFormData, description: e.target.value })} className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px]" />
                            </div>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={serviceFormData.isActive} onChange={e => setServiceFormData({ ...serviceFormData, isActive: e.target.checked })} /> Идэвхтэй</label>
                            <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-4 py-2 text-sm">Болих</button><button type="submit" disabled={isSavingService} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">{isSavingService ? '...' : 'Хадгалах'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
