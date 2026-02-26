"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export default function EquipmentPage() {
    const [equipmentList, setEquipmentList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<any | null>(null);

    // Image upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "camera",
        images: "",
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

    const fetchEquipment = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/equipment');
            if (res.ok) {
                const data = await res.json();
                setEquipmentList(data);
            }
        } catch (error) {
            console.error("Error fetching equipment:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const handleOpenModal = (equipment = null) => {
        if (equipment) {
            setEditingEquipment(equipment);
            setFormData({
                name: equipment.name,
                description: equipment.description || "",
                type: equipment.type,
                images: equipment.images || "",
            });
        } else {
            setEditingEquipment(null);
            setFormData({ name: "", description: "", type: "camera", images: "" });
        }
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, images: data.url }));
                toast.success("Зураг амжилттай хуулагдлаа!");
            } else {
                toast.error("Зураг хуулахад алдаа гарлаа.");
            }
        } catch (error) {
            console.error("Image upload failed", error);
            toast.error("Зураг хуулахад алдаа гарлаа. Сервертэй холбогдож чадсангүй.");
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const method = editingEquipment ? 'PATCH' : 'POST';
            const url = editingEquipment
                ? `http://localhost:3001/api/equipment/${editingEquipment.id}`
                : 'http://localhost:3001/api/equipment';

            const payload = {
                ...formData,
                images: formData.images || undefined
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchEquipment();
                setIsModalOpen(false);
                toast.success(editingEquipment ? "Төхөөрөмжийн мэдээлэл шинэчлэгдлээ" : "Төхөөрөмж амжилттай нэмэгдлээ");
            } else {
                toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
            }
        } catch (error) {
            console.error("Failed to save equipment", error);
            toast.error("Сервертэй холбогдоход алдаа гарлаа.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Та энэ төхөөрөмжийг устгахдаа итгэлтэй байна уу?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:3001/api/equipment/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setEquipmentList(equipmentList.filter(eq => eq.id !== id));
                toast.success("Төхөөрөмж устгагдлаа");
            } else {
                toast.error("Устгахад алдаа гарлаа.");
            }
        } catch (error) {
            console.error("Failed to delete equipment", error);
            toast.error("Сервертэй холбогдоход алдаа гарлаа.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Төхөөрөмж</h1>
                    <p className="text-muted-foreground mt-1">Студио болон үйлчилгээнд ашиглагдах тоног төхөөрөмжүүд.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Төхөөрөмж нэмэх
                </button>
            </div>

            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium border-b w-[80px]">Зураг</th>
                                <th className="px-6 py-4 font-medium border-b w-[200px]">Нэр</th>
                                <th className="px-6 py-4 font-medium border-b w-[150px]">Төрөл</th>
                                <th className="px-6 py-4 font-medium border-b">Тайлбар</th>
                                <th className="px-6 py-4 font-medium border-b w-[120px] text-right">Үйлдэл</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        Мэдээлэл уншиж байна...
                                    </td>
                                </tr>
                            ) : equipmentList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        Одоогоор төхөөрөмж бүртгэгдээгүй байна.
                                    </td>
                                </tr>
                            ) : (
                                equipmentList.map((equipment) => (
                                    <tr key={equipment.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            {equipment.images ? (
                                                <div className="w-12 h-12 relative rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border/50">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={equipment.images} alt={equipment.name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-md bg-muted/50 flex items-center justify-center border border-border/30">
                                                    <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">{equipment.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                                                {equipment.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[300px]" title={equipment.description}>
                                            {equipment.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleOpenModal(equipment)}
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(equipment.id)}
                                                    className="text-muted-foreground hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-lg border border-border/50 shadow-lg">
                        <div className="flex items-center justify-between border-b border-border/50 p-4">
                            <h2 className="text-lg font-semibold">{editingEquipment ? 'Төхөөрөмж засах' : 'Шинэ төхөөрөмж нэмэх'}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full p-2 hover:bg-muted/50 transition-colors"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Төхөөрөмжийн нэр</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Sony A7 IV, Godox 100W гэх мэт..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Төрөл (Ангилал)</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {equipmentTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Image Upload Component */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center justify-between">
                                    Төхөөрөмжийн зураг
                                    {formData.images && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, images: "" }))}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            Зураг устгах
                                        </button>
                                    )}
                                </label>
                                <div className="flex gap-4 items-start">
                                    <div className="w-24 h-24 shrink-0 rounded-md border border-border/50 bg-muted flex items-center justify-center overflow-hidden relative">
                                        {formData.images ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={formData.images} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingImage}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border/50 bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                                        >
                                            {isUploadingImage ? (
                                                <span className="animate-pulse">Хуулж байна...</span>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-4 h-4" />
                                                    Зураг сонгох
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-muted-foreground text-center">
                                            Санал болгох хэмжээ: 500x500px, PNG эсвэл JPG байх.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Тайлбар (Заавал биш)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Үзүүлэлтүүд эсвэл нэмэлт мэдээлэл..."
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-md text-sm font-medium border border-border/50 hover:bg-muted/50 transition-colors"
                                >
                                    Болих
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
