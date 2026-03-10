"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function BundlesPage() {
    const [loading, setLoading] = useState(true);
    const [bundles, setBundles] = useState<any[]>([]);

    // --- BUNDLE STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingBundle, setEditingBundle] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        image: "",
        isActive: true,
        includedServices: [] as string[],
        amenities: [] as string[],
        equipmentIds: [] as number[],
    });

    // Equipment list
    const [allEquipment, setAllEquipment] = useState<any[]>([]);

    // Image Upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const fetchData = async () => {
        try {
            const [resBundles, resEquipment] = await Promise.all([
                fetch(`${API}/bundle-services`),
                fetch(`${API}/equipment`),
            ]);
            if (resBundles.ok) setBundles(await resBundles.json());
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
            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, image: data.url }));
                toast.success("Зураг хуулагдлаа!");
            } else {
                toast.error("Зураг хуулахад алдаа.");
            }
        } catch { toast.error("Сервертэй холбогдоход алдаа."); }
        finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const openModal = (bundle: any = null) => {
        setEditingBundle(bundle);
        setFormData({
            name: bundle?.name || "",
            description: bundle?.description || "",
            price: bundle?.price?.toString() || "",
            image: bundle?.image || "",
            isActive: bundle?.isActive ?? true,
            includedServices: Array.isArray(bundle?.includedServices) ? bundle.includedServices : [],
            amenities: Array.isArray(bundle?.amenities) ? bundle.amenities : [],
            equipmentIds: bundle?.equipments?.map((e: any) => e.equipmentId) || [],
        });
        setIsModalOpen(true);
    };

    const saveBundle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price) {
            toast.error("Нэр болон үнэ заавал шаардлагатай!");
            return;
        }

        setIsSaving(true);
        try {
            const method = editingBundle ? 'PUT' : 'POST';
            const url = editingBundle ? `${API}/bundle-services/${editingBundle.id}` : `${API}/bundle-services`;
            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                price: parseFloat(formData.price),
                image: formData.image || undefined,
                isActive: formData.isActive,
                includedServices: formData.includedServices,
                amenities: formData.amenities,
                equipments: formData.equipmentIds.map(id => ({ equipmentId: id })),
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchData();
                setIsModalOpen(false);
                toast.success("Багц үйлчилгээ хадгалагдлаа");
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err?.message || "Алдаа гарлаа");
            }
        } catch {
            toast.error("Сервертэй алдаа.");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteBundle = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        const res = await fetch(`${API}/bundle-services/${id}`, {
            method: 'DELETE',
            headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) }
        });
        if (res.ok) {
            setBundles(prev => prev.filter(b => b.id !== id));
            toast.success("Устгагдлаа");
        } else {
            toast.error("Алдаа гарлаа.");
        }
    };

    // Helper for List inputs (Included Services & Amenities)
    const renderListInput = (
        label: string,
        items: string[],
        setItems: (items: string[]) => void,
        placeholder: string,
        idPrefix: string
    ) => (
        <div className="space-y-2">
            <label className="text-xs text-gray-400 block">{label}</label>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    placeholder={placeholder}
                    className="flex-1 bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    id={`${idPrefix}-input`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !items.includes(val)) {
                                setItems([...items, val]);
                                (e.target as HTMLInputElement).value = '';
                            }
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={() => {
                        const input = document.getElementById(`${idPrefix}-input`) as HTMLInputElement;
                        const val = input.value.trim();
                        if (val && !items.includes(val)) {
                            setItems([...items, val]);
                            input.value = '';
                        }
                    }}
                    className="px-3 py-2 bg-white/10 text-gray-200 rounded-md text-sm hover:bg-white/20 transition-colors border border-white/5"
                >
                    Нэмэх
                </button>
            </div>
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-black/10 border border-white/5 rounded-md">
                    {items.map(item => (
                        <span key={item} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-black/20 border border-white/10 text-gray-200 rounded-full">
                            {item}
                            <button
                                type="button"
                                className="text-gray-500 hover:text-red-500 transition-colors"
                                onClick={() => setItems(items.filter(i => i !== item))}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Багц үйлчилгээ</h1>
                    <p className="text-muted-foreground mt-1">Томоохон хэмжээний багц үйлчилгээнүүдийг удирдах хэсэг.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" /> Багц нэмэх
                </button>
            </div>

            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="px-4 py-4 font-medium border-b w-[60px]">Зураг</th>
                            <th className="px-4 py-4 font-medium border-b">Нэр</th>
                            <th className="px-4 py-4 font-medium border-b">Үнэ</th>
                            <th className="px-4 py-4 font-medium border-b">Багтсан зүйлс</th>
                            <th className="px-4 py-4 font-medium border-b w-[90px]">Төлөв</th>
                            <th className="px-4 py-4 font-medium border-b text-right">Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>
                        ) : bundles.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Бүртгэл алга байна.</td></tr>
                        ) : (
                            bundles.map((b) => (
                                <tr key={b.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        {b.image ? (
                                            <div className="w-10 h-10 rounded overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{b.name}</td>
                                    <td className="px-4 py-3 font-medium text-primary">
                                        {Number(b.price).toLocaleString()} ₮
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {(b.includedServices?.length || 0)} үйлчилгээ, {(b.amenities?.length || 0)} онцлог
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${b.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {b.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => openModal(b)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => deleteBundle(b.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Hidden file input */}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

            {/* ================= MODAL ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !isSaving && setIsModalOpen(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingBundle ? 'Багц засах' : 'Шинэ багц нэмэх'}</h2>
                            <button onClick={() => !isSaving && setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="bundle-form" onSubmit={saveBundle} className="space-y-6">
                                {/* Image Upload */}
                                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-lg border border-white/5">
                                    <div className="w-20 h-20 rounded overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {formData.image ? <img src={formData.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-500" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-xs text-gray-400">Багцын зураг</label>
                                        <div className="flex items-center gap-3">
                                            <button type="button" disabled={isUploadingImage} onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm bg-black/20 border border-white/10 hover:bg-white/5 transition-colors rounded-md text-gray-200">
                                                {isUploadingImage ? <span className="animate-pulse">Хуулж байна...</span> : "Зураг сонгох"}
                                            </button>
                                            {formData.image && (
                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: "" }))} className="text-xs text-red-400 hover:text-red-300">Цэвэрлэх</button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Нэр <span className="text-red-500">*</span></label>
                                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Багцын нэр..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Үнэ (₮) <span className="text-red-500">*</span></label>
                                        <input required type="number" min={0} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Үнэ..." />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Тайлбар</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]" placeholder="Багцын тухай ерөнхий тайлбар..." />
                                </div>

                                {/* Dynamic Lists */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderListInput(
                                        "Багтсан үйлчилгээнүүд",
                                        formData.includedServices,
                                        (items) => setFormData(prev => ({ ...prev, includedServices: items })),
                                        "Жишээ: 1х Зураглаач...",
                                        "inc-services"
                                    )}
                                    {renderListInput(
                                        "Давуу талууд / Онцлог",
                                        formData.amenities,
                                        (items) => setFormData(prev => ({ ...prev, amenities: items })),
                                        "Жишээ: 4K бичлэг...",
                                        "amenities"
                                    )}
                                </div>

                                {/* Equipment */}
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 block">Дагалдах тоног төхөөрөмж</label>
                                    {allEquipment.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic">Тоног төхөөрөмж байхгүй байна.</p>
                                    ) : (
                                        <div className="max-h-40 overflow-y-auto rounded-md border border-white/5 bg-black/10 p-3 grid grid-cols-2 gap-2">
                                            {allEquipment.map((eq: any) => { /* eslint-disable-line @typescript-eslint/no-explicit-any */
                                                const checked = formData.equipmentIds.includes(eq.id);
                                                return (
                                                    <label key={eq.id} className="flex items-center gap-2 text-xs text-gray-300 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                                                        <input type="checkbox" checked={checked}
                                                            onChange={() => {
                                                                const ids = checked
                                                                    ? formData.equipmentIds.filter(id => id !== eq.id)
                                                                    : [...formData.equipmentIds, eq.id];
                                                                setFormData({ ...formData, equipmentIds: ids });
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

                                <label className="flex items-center gap-2 text-xs text-gray-300">
                                    <input type="checkbox" className="accent-primary" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                    Идэвхтэй харагдах
                                </label>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Болих</button>
                            <button type="submit" form="bundle-form" disabled={isSaving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSaving ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
