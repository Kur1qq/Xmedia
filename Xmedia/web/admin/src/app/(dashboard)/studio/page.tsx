"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import * as Tabs from '@radix-ui/react-tabs';
import { getToken } from "@/lib/auth";

export default function StudioPage() {
    // Shared State
    const [loading, setLoading] = useState(true);

    // --- STUDIO STATE ---
    const [studios, setStudios] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
    const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
    const [isSavingStudio, setIsSavingStudio] = useState(false);
    const [editingStudio, setEditingStudio] = useState<any | null /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
    const [studioFormData, setStudioFormData] = useState({
        name: "", description: "", address: "", sizeSqm: "", capacity: "",
        images: "", isAvailable: true, equipmentIds: [] as number[],
        amenities: [] as string[],
        packages: [] as { id?: number, hours: number | '', price: number | '' }[],
    });

    // --- EQUIPMENT STATE ---
    const [equipments, setEquipments] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
    const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
    const [isSavingEquipment, setIsSavingEquipment] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<any | null /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
    const [equipmentFormData, setEquipmentFormData] = useState({
        name: "", description: "", type: "camera", images: "",
    });

    const equipmentTypes = [
        { value: "camera", label: "Камер (Camera)" },
        { value: "lighting", label: "Гэрэлтүүлэг (Lighting)" },
        { value: "accessories", label: "Тоноглол (Accessories)" },
        { value: "audio", label: "Дуу (Audio)" },
        { value: "computer", label: "Компьютер (Computer)" },
        { value: "drone", label: "Дрон (Drone)" },
        { value: "background", label: "Дэвсгэр (Background)" },
    ];

    // Shared Image Upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadTarget, setUploadTarget] = useState<'studio' | 'equipment' | null>(null);

    const fetchData = async () => {
        try {
            const [resStudios, resEquipments] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/studio`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/equipment`),
            ]);

            if (resStudios.ok) setStudios(await resStudios.json());
            if (resEquipments.ok) setEquipments(await resEquipments.json());
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
        if (!file || !uploadTarget) return;

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
                if (uploadTarget === 'studio') {
                    setStudioFormData(prev => ({ ...prev, images: data.url }));
                } else if (uploadTarget === 'equipment') {
                    setEquipmentFormData(prev => ({ ...prev, images: data.url }));
                }
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
            setUploadTarget(null);
        }
    };

    // ==========================================
    // STUDIO ACTIONS
    // ==========================================
    const handleOpenStudioModal = (studio: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = null) => {
        if (studio) {
            setEditingStudio(studio);
            setStudioFormData({
                name: studio.name, description: studio.description || "", address: studio.address || "",
                sizeSqm: studio.sizeSqm || "", capacity: studio.capacity || "",
                images: studio.images || "", isAvailable: studio.isAvailable,
                equipmentIds: studio.equipment ? studio.equipment.map((e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => e.equipmentId) : [],
                amenities: studio.amenities || [],
                packages: studio.packages ? studio.packages.map((p: any) => ({ id: p.id, hours: p.hours, price: p.price })) : [],
            });
        } else {
            setEditingStudio(null);
            setStudioFormData({
                name: "", description: "", address: "", sizeSqm: "", capacity: "",
                images: "", isAvailable: true, equipmentIds: [], amenities: [],
                packages: [],
            });
        }
        setIsStudioModalOpen(true);
    };

    const handleSaveStudio = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingStudio(true);

        try {
            const method = editingStudio ? 'PATCH' : 'POST';
            const url = editingStudio ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`}/studio/${editingStudio.id}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/studio`;

            const payload = {
                name: studioFormData.name,
                description: studioFormData.description || undefined,
                address: studioFormData.address || undefined,
                sizeSqm: studioFormData.sizeSqm ? parseFloat(studioFormData.sizeSqm) : undefined,
                capacity: studioFormData.capacity ? parseInt(studioFormData.capacity) : undefined,
                images: studioFormData.images || undefined,
                isAvailable: studioFormData.isAvailable,
                equipmentIds: studioFormData.equipmentIds,
                amenities: studioFormData.amenities,
                packages: studioFormData.packages.map(p => ({
                    hours: Number(p.hours) || 0,
                    price: Number(p.price) || 0
                })),
            };

            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (res.ok) {
                await fetchData();
                setIsStudioModalOpen(false);
                toast.success(editingStudio ? "Студи шинэчлэгдлээ" : "Студи нэмэгдлээ");
            } else {
                toast.error("Алдаа гарлаа.");
            }
        } catch (error) {
            toast.error("Сервертэй алдаа гарав.");
        } finally {
            setIsSavingStudio(false);
        }
    };

    const handleDeleteStudio = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`}/studio/${id}`, { method: 'DELETE' });
            if (res.ok) { setStudios(studios.filter(st => st.id !== id)); toast.success("Устгагдлаа"); }
            else toast.error("Устгахад алдаа гарлаа.");
        } catch (error) { toast.error("Сервертэй холбогдоход алдаа гарлаа."); }
    };

    const toggleEquipmentSelection = (equipmentId: number) => {
        setStudioFormData(prev => {
            const currentIds = prev.equipmentIds;
            if (currentIds.includes(equipmentId)) {
                return { ...prev, equipmentIds: currentIds.filter(id => id !== equipmentId) };
            } else {
                return { ...prev, equipmentIds: [...currentIds, equipmentId] };
            }
        });
    };

    // ==========================================
    // EQUIPMENT ACTIONS
    // ==========================================
    const handleOpenEquipmentModal = (equipment: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = null) => {
        if (equipment) {
            setEditingEquipment(equipment);
            setEquipmentFormData({
                name: equipment.name,
                description: equipment.description || "",
                type: equipment.type,
                images: equipment.images || "",
            });
        } else {
            setEditingEquipment(null);
            setEquipmentFormData({ name: "", description: "", type: "camera", images: "" });
        }
        setIsEquipmentModalOpen(true);
    };

    const handleSaveEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingEquipment(true);

        try {
            const method = editingEquipment ? 'PATCH' : 'POST';
            const url = editingEquipment ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`}/equipment/${editingEquipment.id}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/equipment`;

            const payload = { ...equipmentFormData, images: equipmentFormData.images || undefined };
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (res.ok) {
                await fetchData();
                setIsEquipmentModalOpen(false);
                toast.success(editingEquipment ? "Төхөөрөмж шинэчлэгдлээ" : "Төхөөрөмж нэмэгдлээ");
            } else toast.error("Алдаа гарлаа");
        } catch (error) { toast.error("Сервертэй алдаа гарав."); }
        finally { setIsSavingEquipment(false); }
    };

    const handleDeleteEquipment = async (id: number) => {
        if (!window.confirm("Устгахдаа итгэлтэй байна уу?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}`}/equipment/${id}`, { method: 'DELETE' });
            if (res.ok) { setEquipments(equipments.filter(e => e.id !== id)); toast.success("Төхөөрөмж устгагдлаа"); }
            else toast.error("Алдаа гарлаа.");
        } catch (error) { toast.error("Сервертэй холбогдоход алдаа гарлаа."); }
    };


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Студио Удирдлага</h1>
                <p className="text-muted-foreground mt-1">Студийн өрөөнүүд болон тоног төхөөрөмжийг удирдах хэсэг.</p>
            </div>

            <Tabs.Root defaultValue="studios" className="flex flex-col w-full">
                <Tabs.List className="flex shrink-0 border-b border-border/50 bg-background" aria-label="Management Tabs">
                    <Tabs.Trigger
                        value="studios"
                        className="px-5 h-[45px] flex items-center justify-center text-sm font-medium leading-none text-muted-foreground select-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary outline-none cursor-pointer transition-colors"
                    >
                        Студиуд (Үндсэн)
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="equipments"
                        className="px-5 h-[45px] flex items-center justify-center text-sm font-medium leading-none text-muted-foreground select-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary outline-none cursor-pointer transition-colors"
                    >
                        Тоног төхөөрөмж
                    </Tabs.Trigger>
                </Tabs.List>

                {/* ===================================== */}
                {/* STUDIOS TAB CONTENT */}
                {/* ===================================== */}
                <Tabs.Content value="studios" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Студиуд</h2>
                        <button onClick={() => handleOpenStudioModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Нэмэх
                        </button>
                    </div>

                    <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium border-b w-[80px]">Зураг</th>
                                    <th className="px-6 py-4 font-medium border-b w-[200px]">Нэр</th>
                                    <th className="px-6 py-4 font-medium border-b">Хаяг</th>
                                    <th className="px-6 py-4 font-medium border-b">Багц үнэ</th>
                                    <th className="px-6 py-4 font-medium border-b w-[100px]">Төлөв</th>
                                    <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : studios.length === 0 ? (<tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Бүртгэл алга байна.</td></tr>)
                                        : studios.map((s) => (
                                            <tr key={s.id} className="hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    {s.images ? (
                                                        <div className="w-10 h-10 rounded overflow-hidden">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={s.images} alt={s.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>}
                                                </td>
                                                <td className="px-6 py-4 font-medium">{s.name}</td>
                                                <td className="px-6 py-4 truncate max-w-[200px]">{s.address || '-'}</td>
                                                <td className="px-6 py-4">
                                                    {s.packages && s.packages.length > 0
                                                        ? s.packages.map((pkg: any) => (
                                                            <div key={pkg.id} className="text-xs">
                                                                {pkg.hours} цаг - {Number(pkg.price).toLocaleString()}₮
                                                            </div>
                                                        ))
                                                        : <span className="text-muted-foreground">-</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.isAvailable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                                        {s.isAvailable ? 'Нээлттэй' : 'Хаалттай'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => handleOpenStudioModal(s)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteStudio(s.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                </Tabs.Content>

                {/* ===================================== */}
                {/* EQUIPMENTS TAB CONTENT */}
                {/* ===================================== */}
                <Tabs.Content value="equipments" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Тоног төхөөрөмж</h2>
                        <button onClick={() => handleOpenEquipmentModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Төхөөрөмж нэмэх
                        </button>
                    </div>

                    <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium border-b w-[80px]">Зураг</th>
                                    <th className="px-6 py-4 font-medium border-b w-[200px]">Нэр</th>
                                    <th className="px-6 py-4 font-medium border-b w-[150px]">Төрөл</th>
                                    <th className="px-6 py-4 font-medium border-b">Тайлбар</th>
                                    <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : equipments.length === 0 ? (<tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Бүртгэл алга байна.</td></tr>)
                                        : equipments.map((e) => (
                                            <tr key={e.id} className="hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    {e.images ? (
                                                        <div className="w-10 h-10 rounded overflow-hidden">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={e.images} alt={e.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>}
                                                </td>
                                                <td className="px-6 py-4 font-medium">{e.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">{e.type}</span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground truncate max-w-[300px]">{e.description || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => handleOpenEquipmentModal(e)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteEquipment(e.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
            {/* STUDIO MODAL */}
            {/* ===================================== */}
            {isStudioModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !isSavingStudio && setIsStudioModalOpen(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingStudio ? 'Студи засах' : 'Шинэ студи нэмэх'}</h2>
                            <button onClick={() => !isSavingStudio && setIsStudioModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="studio-form" onSubmit={handleSaveStudio} className="space-y-4">
                                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-lg border border-white/5">
                                    <div className="w-16 h-16 rounded overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {studioFormData.images ? <img src={studioFormData.images} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-500" />}
                                    </div>
                                    <button type="button" disabled={isUploadingImage} onClick={() => { setUploadTarget('studio'); fileInputRef.current?.click(); }} className="px-3 py-1.5 text-sm bg-black/20 border border-white/10 hover:bg-white/5 transition-colors rounded-md text-gray-200 disabled:opacity-50">
                                        Хуулах
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Нэр <span className="text-red-500">*</span></label>
                                        <input required value={studioFormData.name} onChange={e => setStudioFormData({ ...studioFormData, name: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Хаяг байршил</label>
                                        <input value={studioFormData.address} onChange={e => setStudioFormData({ ...studioFormData, address: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Талбайн хэмжээ (м.кв)</label>
                                        <input type="number" value={studioFormData.sizeSqm} onChange={e => setStudioFormData({ ...studioFormData, sizeSqm: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Багтаамж (хүн)</label>
                                        <input type="number" value={studioFormData.capacity} onChange={e => setStudioFormData({ ...studioFormData, capacity: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                </div>

                                {/* Packages */}
                                <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs text-gray-400">Үнийн багцууд</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudioFormData(prev => ({
                                                    ...prev,
                                                    packages: [...prev.packages, { hours: '', price: '' }]
                                                }));
                                            }}
                                            className="text-[10px] flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Багц нэмэх
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {studioFormData.packages.map((pkg, i) => (
                                            <div key={i} className="flex gap-3 items-start bg-black/20 p-3 rounded-lg border border-white/5 relative group">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[10px] text-gray-500 uppercase font-semibold">Цаг (Hours)</label>
                                                    <input
                                                        type="number"
                                                        value={pkg.hours}
                                                        onChange={e => {
                                                            const newPkgs = [...studioFormData.packages];
                                                            newPkgs[i].hours = e.target.value === '' ? '' : Number(e.target.value);
                                                            setStudioFormData({ ...studioFormData, packages: newPkgs });
                                                        }}
                                                        placeholder="Жнь: 3"
                                                        className="w-full bg-white/5 border border-white/5 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[10px] text-gray-500 uppercase font-semibold">Үнэ (Price ₮)</label>
                                                    <input
                                                        type="number"
                                                        value={pkg.price}
                                                        onChange={e => {
                                                            const newPkgs = [...studioFormData.packages];
                                                            newPkgs[i].price = e.target.value === '' ? '' : Number(e.target.value);
                                                            setStudioFormData({ ...studioFormData, packages: newPkgs });
                                                        }}
                                                        placeholder="Жнь: 440000"
                                                        className="w-full bg-white/5 border border-white/5 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newPkgs = [...studioFormData.packages];
                                                        newPkgs.splice(i, 1);
                                                        setStudioFormData({ ...studioFormData, packages: newPkgs });
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {studioFormData.packages.length === 0 && (
                                            <p className="text-xs text-gray-500 italic text-center py-4 bg-white/5 rounded border border-dashed border-white/10">
                                                Үнийн багц нэмэгдээгүй байна
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Тайлбар</label>
                                    <textarea value={studioFormData.description} onChange={e => setStudioFormData({ ...studioFormData, description: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]" />
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
                                                    if (val && !studioFormData.amenities.includes(val)) {
                                                        setStudioFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
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
                                                if (val && !studioFormData.amenities.includes(val)) {
                                                    setStudioFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
                                                    input.value = '';
                                                }
                                            }}
                                            className="px-3 py-2 bg-white/10 text-gray-200 rounded-md text-sm hover:bg-white/20 transition-colors border border-white/5"
                                        >
                                            Нэмэх
                                        </button>
                                    </div>
                                    {studioFormData.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-3 bg-black/10 border border-white/5 rounded-md">
                                            {studioFormData.amenities.map(amenity => (
                                                <span key={amenity} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-black/20 border border-white/10 text-gray-200 rounded-full">
                                                    {amenity}
                                                    <button
                                                        type="button"
                                                        className="text-gray-500 hover:text-red-500 transition-colors"
                                                        onClick={() => setStudioFormData(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }))}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 block">Дагалдах тоног төхөөрөмж</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border border-white/5 bg-black/10 rounded-md">
                                        {equipments.map(eq => (
                                            <label key={eq.id} className="flex items-center gap-2 text-xs text-gray-300 p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors">
                                                <input type="checkbox" className="accent-primary" checked={studioFormData.equipmentIds.includes(eq.id)} onChange={() => toggleEquipmentSelection(eq.id)} /> {eq.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 text-xs text-gray-300">
                                    <input type="checkbox" className="accent-primary" checked={studioFormData.isAvailable} onChange={e => setStudioFormData({ ...studioFormData, isAvailable: e.target.checked })} />
                                    Идэвхтэй (Захиалга авах боломжтой)
                                </label>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsStudioModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                                Болих
                            </button>
                            <button type="submit" form="studio-form" disabled={isSavingStudio} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSavingStudio ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}
                            </button>
                        </div>
                    </div>
                </div >
            )}

            {/* ===================================== */}
            {/* EQUIPMENT MODAL */}
            {/* ===================================== */}
            {isEquipmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !isSavingEquipment && setIsEquipmentModalOpen(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingEquipment ? 'Төхөөрөмж засах' : 'Төхөөрөмж үүсгэх'}</h2>
                            <button onClick={() => !isSavingEquipment && setIsEquipmentModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="equipment-form" onSubmit={handleSaveEquipment} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 flex items-center justify-between block">
                                        Төхөөрөмжийн зураг
                                        {equipmentFormData.images && (
                                            <button type="button" onClick={() => setEquipmentFormData(prev => ({ ...prev, images: "" }))} className="text-[10px] text-red-500 hover:underline">Зураг устгах</button>
                                        )}
                                    </label>
                                    <div className="flex gap-4 items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="w-16 h-16 shrink-0 rounded-md border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {equipmentFormData.images ? <img src={equipmentFormData.images} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <button type="button" onClick={() => { setUploadTarget('equipment'); fileInputRef.current?.click(); }} disabled={isUploadingImage} className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-white/20 bg-black/20 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors focus-visible:outline-none">
                                                {isUploadingImage ? <span className="animate-pulse">Хуулж байна...</span> : <><UploadCloud className="w-4 h-4" /> Зураг сонгох</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 block">Нэр <span className="text-red-500">*</span></label>
                                    <input required value={equipmentFormData.name} onChange={e => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 block">Төрөл (Ангилал)</label>
                                    <select value={equipmentFormData.type} onChange={(e) => setEquipmentFormData({ ...equipmentFormData, type: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                                        {equipmentTypes.map(type => (
                                            <option key={type.value} value={type.value} className="bg-[#1e1e1e]">{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 block">Тайлбар</label>
                                    <textarea value={equipmentFormData.description} onChange={e => setEquipmentFormData({ ...equipmentFormData, description: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]" />
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsEquipmentModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                                Болих
                            </button>
                            <button type="submit" form="equipment-form" disabled={isSavingEquipment} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSavingEquipment ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
