"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, Image as ImageIcon, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import * as Tabs from '@radix-ui/react-tabs';
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const tabCls = "px-5 h-[45px] flex items-center justify-center text-sm font-medium leading-none text-muted-foreground select-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary outline-none cursor-pointer transition-colors";

interface ServicePackage {
    id?: number;
    subTypeId: string;
    price: string;
    priceLabel: string;
}

export default function PhotographerPage() {
    const [loading, setLoading] = useState(true);

    // --- CATEGORY STATE ---
    const [categories, setCategories] = useState<any[]>([]);/* eslint-disable-line @typescript-eslint/no-explicit-any */
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);/* eslint-disable-line @typescript-eslint/no-explicit-any */
    const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "" });

    // --- MAIN TYPE STATE ---
    const [mainTypes, setMainTypes] = useState<any[]>([]);/* eslint-disable-line @typescript-eslint/no-explicit-any */
    const [isMainTypeModalOpen, setIsMainTypeModalOpen] = useState(false);
    const [isSavingMainType, setIsSavingMainType] = useState(false);
    const [editingMainType, setEditingMainType] = useState<any | null>(null);/* eslint-disable-line @typescript-eslint/no-explicit-any */
    const [mainTypeForm, setMainTypeForm] = useState({ name: "", description: "", sortOrder: "0" });
    const [expandedMainTypes, setExpandedMainTypes] = useState<Record<number, boolean>>({});

    // --- SUB TYPE STATE ---
    const [isSubTypeModalOpen, setIsSubTypeModalOpen] = useState(false);
    const [isSavingSubType, setIsSavingSubType] = useState(false);
    const [editingSubType, setEditingSubType] = useState<any | null>(null);/* eslint-disable-line @typescript-eslint/no-explicit-any */
    const [subTypeForm, setSubTypeForm] = useState({ name: "", description: "", sortOrder: "0", mainTypeId: "" });

    // --- SERVICE STATE ---
    const [services, setServices] = useState<any[]>([]);/* eslint-disable-line @typescript-eslint/no-explicit-any */
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isSavingService, setIsSavingService] = useState(false);
    const [editingService, setEditingService] = useState<any | null>(null);/* eslint-disable-line @typescript-eslint/no-explicit-any */
    const [serviceFormData, setServiceFormData] = useState({
        name: "", categoryId: "", mainTypeId: "",
        description: "", image: "", isActive: true,
        equipmentIds: [] as number[],
        amenities: [] as string[],
        packages: [] as ServicePackage[],
    });

    // Equipment list
    const [allEquipment, setAllEquipment] = useState<any[]>([]);

    // Derived: sub-types filtered by selected main type
    const filteredSubTypes = mainTypes.find(m => m.id === parseInt(serviceFormData.mainTypeId))?.subTypes || [];

    // Image Upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const fetchData = async () => {
        try {
            const [resCategories, resServices, resMainTypes, resEquipment] = await Promise.all([
                fetch(`${API}/categories`),
                fetch(`${API}/photographer-services`),
                fetch(`${API}/photographer-types/main`),
                fetch(`${API}/equipment`),
            ]);
            if (resCategories.ok) setCategories(await resCategories.json());
            if (resServices.ok) setServices(await resServices.json());
            if (resMainTypes.ok) setMainTypes(await resMainTypes.json());
            if (resEquipment.ok) setAllEquipment(await resEquipment.json());
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
            const res = await fetch(`${API}/upload`, {
                method: 'POST',
                headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
                body: fd
            });
            if (res.ok) { const data = await res.json(); setServiceFormData(prev => ({ ...prev, image: data.url })); toast.success("Зураг хуулагдлаа!"); }
            else toast.error("Зураг хуулахад алдаа.");
        } catch { toast.error("Сервертэй холбогдоход алдаа."); }
        finally { setIsUploadingImage(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    // ==================== CATEGORY ====================
    const openCategoryModal = (cat: any = null) => {/* eslint-disable-line @typescript-eslint/no-explicit-any */
        setEditingCategory(cat);
        setCategoryFormData({ name: cat?.name || "", description: cat?.description || "" });
        setIsCategoryModalOpen(true);
    };
    const saveCategory = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSavingCategory(true);
        try {
            const method = editingCategory ? 'PATCH' : 'POST';
            const url = editingCategory ? `${API}/categories/${editingCategory.id}` : `${API}/categories`;
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) }, body: JSON.stringify(categoryFormData) });
            if (res.ok) { await fetchData(); setIsCategoryModalOpen(false); toast.success("Ангилал хадгалагдлаа"); }
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setIsSavingCategory(false); }
    };
    const deleteCategory = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        const res = await fetch(`${API}/categories/${id}`, { method: 'DELETE', headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) } });
        if (res.ok) { setCategories(prev => prev.filter(c => c.id !== id)); toast.success("Устгагдлаа"); }
        else toast.error("Алдаа гарлаа.");
    };

    // ==================== MAIN TYPE ====================
    const openMainTypeModal = (mt: any = null) => {/* eslint-disable-line @typescript-eslint/no-explicit-any */
        setEditingMainType(mt);
        setMainTypeForm({ name: mt?.name || "", description: mt?.description || "", sortOrder: mt?.sortOrder?.toString() || "0" });
        setIsMainTypeModalOpen(true);
    };
    const saveMainType = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSavingMainType(true);
        try {
            const method = editingMainType ? 'PATCH' : 'POST';
            const url = editingMainType ? `${API}/photographer-types/main/${editingMainType.id}` : `${API}/photographer-types/main`;
            const payload = { name: mainTypeForm.name, description: mainTypeForm.description || undefined, sortOrder: parseInt(mainTypeForm.sortOrder) || 0 };
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) }, body: JSON.stringify(payload) });
            if (res.ok) { await fetchData(); setIsMainTypeModalOpen(false); toast.success("Хадгалагдлаа"); }
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setIsSavingMainType(false); }
    };
    const deleteMainType = async (id: number) => {
        if (!window.confirm("Устгавал дагалдах дэд төрлүүд устгагдана. Итгэлтэй байна уу?")) return;
        const res = await fetch(`${API}/photographer-types/main/${id}`, { method: 'DELETE', headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) } });
        if (res.ok) { await fetchData(); toast.success("Устгагдлаа"); }
        else toast.error("Алдаа гарлаа.");
    };

    // ==================== SUB TYPE ====================
    const openSubTypeModal = (mainTypeId: number, st: any = null) => {/* eslint-disable-line @typescript-eslint/no-explicit-any */
        setEditingSubType(st);
        setSubTypeForm({ name: st?.name || "", description: st?.description || "", sortOrder: st?.sortOrder?.toString() || "0", mainTypeId: (st?.mainTypeId || mainTypeId).toString() });
        setIsSubTypeModalOpen(true);
    };
    const saveSubType = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSavingSubType(true);
        try {
            const method = editingSubType ? 'PATCH' : 'POST';
            const url = editingSubType ? `${API}/photographer-types/sub/${editingSubType.id}` : `${API}/photographer-types/sub`;
            const payload = { name: subTypeForm.name, description: subTypeForm.description || undefined, sortOrder: parseInt(subTypeForm.sortOrder) || 0, mainTypeId: parseInt(subTypeForm.mainTypeId) };
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) }, body: JSON.stringify(payload) });
            if (res.ok) { await fetchData(); setIsSubTypeModalOpen(false); toast.success("Хадгалагдлаа"); }
            else toast.error("Алдаа гарлаа");
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setIsSavingSubType(false); }
    };
    const deleteSubType = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        const res = await fetch(`${API}/photographer-types/sub/${id}`, { method: 'DELETE', headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) } });
        if (res.ok) { await fetchData(); toast.success("Устгагдлаа"); }
        else toast.error("Алдаа гарлаа.");
    };

    // ==================== SERVICE ====================
    const openServiceModal = (svc: any = null) => {/* eslint-disable-line @typescript-eslint/no-explicit-any */
        setEditingService(svc);
        setServiceFormData({
            name: svc?.name || "", categoryId: svc?.categoryId?.toString() || categories[0]?.id?.toString() || "",
            mainTypeId: svc?.mainTypeId?.toString() || "",
            description: svc?.description || "", image: svc?.image || "",
            isActive: svc?.isActive ?? true,
            equipmentIds: svc?.equipments?.map((e: any) => e.equipmentId) || [],
            amenities: Array.isArray(svc?.amenities) ? svc?.amenities : [],
            packages: svc?.packages?.length ? svc.packages.map((p: any) => ({
                id: p.id, subTypeId: p.subTypeId?.toString() || "", price: p.price?.toString() || "", priceLabel: p.priceLabel || ""
            })) : [{ subTypeId: "", price: "", priceLabel: "" }],
        });
        setIsServiceModalOpen(true);
    };

    const addPackage = () => setServiceFormData(prev => ({ ...prev, packages: [...prev.packages, { subTypeId: "", price: "", priceLabel: "" }] }));
    const removePackage = (idx: number) => setServiceFormData(prev => ({ ...prev, packages: prev.packages.filter((_, i) => i !== idx) }));
    const updatePackage = (idx: number, field: keyof ServicePackage, value: string) => {
        setServiceFormData(prev => {
            const pkgs = [...prev.packages];
            pkgs[idx] = { ...pkgs[idx], [field]: value };
            return { ...prev, packages: pkgs };
        });
    };

    const saveService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceFormData.categoryId) { toast.error("Ангилал сонгоно уу!"); return; }
        if (!serviceFormData.mainTypeId) { toast.error("Үндсэн төрөл сонгоно уу!"); return; }
        if (serviceFormData.packages.length === 0) { toast.error("Ядаж нэг багц (дэд төрөл) оруулна уу!"); return; }
        if (serviceFormData.packages.some(p => !p.subTypeId || !p.price)) { toast.error("Багцын мэдээлэл дутуу байна!"); return; }

        setIsSavingService(true);
        try {
            const method = editingService ? 'PATCH' : 'POST';
            const url = editingService ? `${API}/photographer-services/${editingService.id}` : `${API}/photographer-services`;
            const payload = {
                name: serviceFormData.name, categoryId: parseInt(serviceFormData.categoryId),
                mainTypeId: parseInt(serviceFormData.mainTypeId),
                description: serviceFormData.description || undefined, image: serviceFormData.image || undefined,
                isActive: serviceFormData.isActive,
                equipmentIds: serviceFormData.equipmentIds,
                amenities: serviceFormData.amenities,
                packages: serviceFormData.packages.map(p => ({
                    subTypeId: parseInt(p.subTypeId),
                    price: parseFloat(p.price),
                    priceLabel: p.priceLabel || undefined,
                })),
            };
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) }, body: JSON.stringify(payload) });
            if (res.ok) { await fetchData(); setIsServiceModalOpen(false); toast.success("Үйлчилгээ хадгалагдлаа"); }
            else { const err = await res.json().catch(() => ({})); toast.error(err?.message || "Алдаа гарлаа"); }
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setIsSavingService(false); }
    };
    const deleteService = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        const res = await fetch(`${API}/photographer-services/${id}`, { method: 'DELETE', headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) } });
        if (res.ok) { setServices(prev => prev.filter(s => s.id !== id)); toast.success("Устгагдлаа"); }
        else toast.error("Алдаа гарлаа.");
    };

    const toggleExpand = (id: number) => setExpandedMainTypes(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Зураглаач</h1>
                <p className="text-muted-foreground mt-1">Зураглаачийн үйлчилгээ, төрлүүд болон ангиллыг удирдах хэсэг.</p>
            </div>

            <Tabs.Root defaultValue="services" className="flex flex-col w-full">
                <Tabs.List className="flex shrink-0 border-b border-border/50 bg-background" aria-label="Management Tabs">
                    <Tabs.Trigger value="services" className={tabCls}>Үйлчилгээ</Tabs.Trigger>
                    <Tabs.Trigger value="types" className={tabCls}>Төрлүүд</Tabs.Trigger>
                    <Tabs.Trigger value="categories" className={tabCls}>Ангилал</Tabs.Trigger>
                </Tabs.List>

                {/* ====================== SERVICES TAB ====================== */}
                <Tabs.Content value="services" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Зураглаачийн үйлчилгээ</h2>
                        <button onClick={() => openServiceModal()} disabled={mainTypes.length === 0} title={mainTypes.length === 0 ? 'Эхлээд Төрлүүд нэмнэ үү' : ''} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            <Plus className="h-4 w-4" /> Үйлчилгээ нэмэх
                        </button>
                    </div>
                    {mainTypes.length === 0 && !loading && (
                        <div className="text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-4 py-3 mb-4">
                            ⚠️ Үйлчилгээ нэмэхийн өмнө <strong>Төрлүүд</strong> табаас үндсэн төрлүүдийг нэмнэ үү. (Жишээ: Зураглаач, Зурагчин, Дрон)
                        </div>
                    )}
                    <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-4 font-medium border-b w-[60px]">Зураг</th>
                                    <th className="px-4 py-4 font-medium border-b">Нэр</th>
                                    <th className="px-4 py-4 font-medium border-b">Үндсэн төрөл</th>
                                    <th className="px-4 py-4 font-medium border-b">Ангилал</th>
                                    <th className="px-4 py-4 font-medium border-b">Багц, Үнэ</th>
                                    <th className="px-4 py-4 font-medium border-b w-[90px]">Төлөв</th>
                                    <th className="px-4 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : services.length === 0 ? (<tr><td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">Бүртгэл алга байна.</td></tr>)
                                        : services.map((s) => (
                                            <tr key={s.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    {s.image
                                                        ? <div className="w-10 h-10 rounded overflow-hidden">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={s.image} alt={s.name} className="w-full h-full object-cover" /></div>
                                                        : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>}
                                                </td>
                                                <td className="px-4 py-3 font-medium">{s.name}</td>
                                                <td className="px-4 py-3">
                                                    {s.mainType && <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{s.mainType.name}</span>}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground text-xs">{s.category?.name || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        {s.packages?.map((p: any) => (
                                                            <span key={p.id} className="text-xs text-muted-foreground">
                                                                {p.subType?.name || p.priceLabel}: <span className="text-foreground font-medium">{Number(p.price).toLocaleString()} ₮</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${s.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{s.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => openServiceModal(s)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => deleteService(s.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                </Tabs.Content>

                {/* ====================== TYPES TAB ====================== */}
                <Tabs.Content value="types" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Үйлчилгээний Төрлүүд</h2>
                        <button onClick={() => openMainTypeModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Үндсэн төрөл нэмэх
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Жишээ: <strong>Зураглаач</strong> (Рийл, Богино контент, Нэвтрүүлэг...), <strong>Зурагчин</strong> (Фото, Модерн...), <strong>Дрон</strong> (Батарей...)</p>

                    {loading ? <p className="text-muted-foreground text-sm">Уншиж байна...</p>
                        : mainTypes.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-border/50 rounded-md text-muted-foreground text-sm">
                                Үндсэн төрөл байхгүй байна. <br /> <strong>Үндсэн төрөл нэмэх</strong> товчоор нэмнэ үү.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {mainTypes.map(mt => (
                                    <div key={mt.id} className="rounded-md border border-border/50 bg-card overflow-hidden">
                                        {/* Main Type Row */}
                                        <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                                            <button onClick={() => toggleExpand(mt.id)} className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors">
                                                {expandedMainTypes[mt.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                {mt.name}
                                                <span className="text-xs text-muted-foreground font-normal">({mt.subTypes?.length || 0} дэд төрөл)</span>
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openSubTypeModal(mt.id)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                                    <Plus className="w-3 h-3" /> Дэд төрөл нэмэх
                                                </button>
                                                <button onClick={() => openMainTypeModal(mt)} className="text-muted-foreground hover:text-primary ml-2"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => deleteMainType(mt.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        {/* Sub Types (expandable) */}
                                        {expandedMainTypes[mt.id] && (
                                            <div className="divide-y divide-border/50">
                                                {mt.subTypes?.length === 0 ? (
                                                    <p className="px-8 py-3 text-sm text-muted-foreground italic">Дэд төрөл байхгүй байна.</p>
                                                ) : mt.subTypes?.map((st: any) => (/* eslint-disable-line @typescript-eslint/no-explicit-any */
                                                    <div key={st.id} className="flex items-center justify-between px-8 py-2.5 text-sm hover:bg-muted/20">
                                                        <div>
                                                            <span className="font-medium">{st.name}</span>
                                                            {st.description && <span className="ml-2 text-muted-foreground text-xs">— {st.description}</span>}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => openSubTypeModal(mt.id, st)} className="text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => deleteSubType(st.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                </Tabs.Content>

                {/* ====================== CATEGORY TAB ====================== */}
                <Tabs.Content value="categories" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Үйлчилгээний Ангилал</h2>
                        <button onClick={() => openCategoryModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
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
                                                        <button onClick={() => openCategoryModal(c)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => deleteCategory(c.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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

            {/* ================= CATEGORY MODAL ================= */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-lg border border-border/50 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">{editingCategory ? 'Ангилал засах' : 'Ангилал үүсгэх'}</h2>
                            <button onClick={() => setIsCategoryModalOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                        </div>
                        <form onSubmit={saveCategory} className="space-y-4">
                            <div className="space-y-1"><label className="text-sm font-medium">Нэр <span className="text-red-500">*</span></label>
                                <input required value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Тайлбар</label>
                                <textarea value={categoryFormData.description} onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })} className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px]" /></div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-sm">Болих</button>
                                <button type="submit" disabled={isSavingCategory} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">{isSavingCategory ? '...' : 'Хадгалах'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MAIN TYPE MODAL ================= */}
            {isMainTypeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-lg border border-border/50 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">{editingMainType ? 'Үндсэн төрөл засах' : 'Үндсэн төрөл нэмэх'}</h2>
                            <button onClick={() => setIsMainTypeModalOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                        </div>
                        <form onSubmit={saveMainType} className="space-y-4">
                            <div className="space-y-1"><label className="text-sm font-medium">Нэр <span className="text-red-500">*</span></label>
                                <input required placeholder="Зураглаач, Зурагчин, Дрон..." value={mainTypeForm.name} onChange={e => setMainTypeForm({ ...mainTypeForm, name: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Тайлбар</label>
                                <textarea value={mainTypeForm.description} onChange={e => setMainTypeForm({ ...mainTypeForm, description: e.target.value })} className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[60px]" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Дараалал</label>
                                <input type="number" value={mainTypeForm.sortOrder} onChange={e => setMainTypeForm({ ...mainTypeForm, sortOrder: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" /></div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsMainTypeModalOpen(false)} className="px-4 py-2 text-sm">Болих</button>
                                <button type="submit" disabled={isSavingMainType} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">{isSavingMainType ? '...' : 'Хадгалах'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= SUB TYPE MODAL ================= */}
            {isSubTypeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-lg border border-border/50 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">{editingSubType ? 'Дэд төрөл засах' : 'Дэд төрөл нэмэх'}</h2>
                            <button onClick={() => setIsSubTypeModalOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                        </div>
                        <form onSubmit={saveSubType} className="space-y-4">
                            <div className="space-y-1"><label className="text-sm font-medium">Үндсэн төрөл <span className="text-red-500">*</span></label>
                                <select required value={subTypeForm.mainTypeId} onChange={e => setSubTypeForm({ ...subTypeForm, mainTypeId: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                    <option value="" disabled>Сонгох...</option>
                                    {mainTypes.map(mt => <option key={mt.id} value={mt.id}>{mt.name}</option>)}
                                </select></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Нэр <span className="text-red-500">*</span></label>
                                <input required placeholder="Рийл, Богино контент, Фото, Батарей..." value={subTypeForm.name} onChange={e => setSubTypeForm({ ...subTypeForm, name: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Тайлбар</label>
                                <textarea value={subTypeForm.description} onChange={e => setSubTypeForm({ ...subTypeForm, description: e.target.value })} className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[60px]" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Дараалал</label>
                                <input type="number" value={subTypeForm.sortOrder} onChange={e => setSubTypeForm({ ...subTypeForm, sortOrder: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" /></div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsSubTypeModalOpen(false)} className="px-4 py-2 text-sm">Болих</button>
                                <button type="submit" disabled={isSavingSubType} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">{isSavingSubType ? '...' : 'Хадгалах'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= SERVICE MODAL ================= */}
            {isServiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border/50 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">{editingService ? 'Үйлчилгээ засах' : 'Шинэ үйлчилгээ нэмэх'}</h2>
                            <button onClick={() => setIsServiceModalOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                        </div>
                        <form onSubmit={saveService} className="space-y-4">
                            {/* Image */}
                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                                <div className="w-16 h-16 rounded overflow-hidden bg-muted flex items-center justify-center shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {serviceFormData.image ? <img src={serviceFormData.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                                </div>
                                <button type="button" disabled={isUploadingImage} onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm bg-background border border-border/50 rounded-md hover:bg-muted">
                                    {isUploadingImage ? "Хуулж байна..." : "Зураг хуулах"}
                                </button>
                            </div>

                            {/* Category + Name */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 col-span-2">
                                    <label className="text-sm font-medium">Ангилал <span className="text-red-500">*</span></label>
                                    <select required value={serviceFormData.categoryId} onChange={e => setServiceFormData({ ...serviceFormData, categoryId: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                        <option value="" disabled>Сонгох...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-sm font-medium">Үйлчилгээний нэр <span className="text-red-500">*</span></label>
                                    <input required value={serviceFormData.name} onChange={e => setServiceFormData({ ...serviceFormData, name: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="Нэр..." />
                                </div>
                            </div>

                            {/* Main Type */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Үндсэн төрөл <span className="text-red-500">*</span></label>
                                <select required value={serviceFormData.mainTypeId} onChange={e => setServiceFormData({ ...serviceFormData, mainTypeId: e.target.value, packages: [{ subTypeId: "", price: "", priceLabel: "" }] })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                    <option value="" disabled>Сонгох...</option>
                                    {mainTypes.map(mt => <option key={mt.id} value={mt.id}>{mt.name}</option>)}
                                </select>
                            </div>

                            {/* Service Packages */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Үнийн багцууд (Контентийн төрлүүд) <span className="text-red-500">*</span></label>
                                    <button type="button" onClick={addPackage} disabled={!serviceFormData.mainTypeId || filteredSubTypes.length === 0} className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50">
                                        <Plus className="w-3 h-3" /> Нэмэх
                                    </button>
                                </div>
                                {!serviceFormData.mainTypeId ? (
                                    <p className="text-xs text-muted-foreground">Эхлээд үндсэн төрлөө сонгоно уу.</p>
                                ) : filteredSubTypes.length === 0 ? (
                                    <p className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded p-2">⚠️ Энэ төрөлд дэд төрөл байхгүй байна. Төрлүүд табыг ашиглан дэд төрөл нэмнэ үү.</p>
                                ) : (
                                    <div className="space-y-2 rounded-md border border-border/50 p-3 bg-muted/20">
                                        {serviceFormData.packages.map((pkg, idx) => (
                                            <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 items-center">
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Контентийн төрөл</label>
                                                    <select required value={pkg.subTypeId} onChange={e => updatePackage(idx, 'subTypeId', e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                                        <option value="" disabled>Сонгох...</option>
                                                        {filteredSubTypes.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Нэршил (Сонголттой)</label>
                                                    <input type="text" value={pkg.priceLabel || ""} onChange={e => updatePackage(idx, 'priceLabel', e.target.value)} placeholder="Жишээ: Бичлэг + Эвлүүлэг..." className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Үнэ (₮)</label>
                                                    <input type="number" min={0} value={pkg.price} onChange={e => updatePackage(idx, 'price', e.target.value)} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" required />
                                                </div>
                                                <button type="button" onClick={() => removePackage(idx)} disabled={serviceFormData.packages.length <= 1} className="mt-5 text-muted-foreground hover:text-red-500 disabled:opacity-30 flex justify-center">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Тайлбар</label>
                                <textarea value={serviceFormData.description} onChange={e => setServiceFormData({ ...serviceFormData, description: e.target.value })} className="w-full p-3 rounded-md border border-input bg-background text-sm min-h-[80px]" placeholder="Үйлчилгээний тайлбар..." />
                            </div>

                            {/* Amenities */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium block">Онцлог талууд</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Шинэ онцлог..."
                                        className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
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
                                        className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm border border-border/50 hover:bg-muted"
                                    >
                                        Нэмэх
                                    </button>
                                </div>
                                {serviceFormData.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 border border-border/50 rounded-md">
                                        {serviceFormData.amenities.map(amenity => (
                                            <span key={amenity} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-background border border-border text-foreground rounded-full">
                                                {amenity}
                                                <button
                                                    type="button"
                                                    className="text-muted-foreground hover:text-red-500"
                                                    onClick={() => setServiceFormData(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }))}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Equipment */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Тоног төхөөрөмж</label>
                                {allEquipment.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">Тоног төхөөрөмж байхгүй байна.</p>
                                ) : (
                                    <div className="max-h-40 overflow-y-auto rounded-md border border-input bg-background p-3 grid grid-cols-2 gap-2">
                                        {allEquipment.map((eq: any) => { /* eslint-disable-line @typescript-eslint/no-explicit-any */
                                            const checked = serviceFormData.equipmentIds.includes(eq.id);
                                            return (
                                                <label key={eq.id} className={`flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 transition-colors ${checked ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>
                                                    <input type="checkbox" checked={checked}
                                                        onChange={() => {
                                                            const ids = checked
                                                                ? serviceFormData.equipmentIds.filter(id => id !== eq.id)
                                                                : [...serviceFormData.equipmentIds, eq.id];
                                                            setServiceFormData({ ...serviceFormData, equipmentIds: ids });
                                                        }}
                                                        className="accent-primary"
                                                    />
                                                    {eq.name}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={serviceFormData.isActive} onChange={e => setServiceFormData({ ...serviceFormData, isActive: e.target.checked })} />
                                Идэвхтэй
                            </label>

                            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-4 py-2 text-sm border border-border/50 rounded-md hover:bg-muted">Болих</button>
                                <button type="submit" disabled={isSavingService} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">{isSavingService ? 'Хадгалж байна...' : 'Хадгалах'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
