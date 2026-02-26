"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CategoryPage() {
    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        icon: "",
    });

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategoryList(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || "",
                icon: category.icon || "",
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: "", description: "", icon: "" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const method = editingCategory ? 'PATCH' : 'POST';
            const url = editingCategory
                ? `http://localhost:3001/api/categories/${editingCategory.id}`
                : 'http://localhost:3001/api/categories';

            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                icon: formData.icon || undefined
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchCategories();
                setIsModalOpen(false);
                toast.success(editingCategory ? "Ангилал шинэчлэгдлээ" : "Ангилал амжилттай нэмэгдлээ");
            } else {
                toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
            }
        } catch (error) {
            console.error("Failed to save category", error);
            toast.error("Сервертэй холбогдоход алдаа гарлаа");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Энэ ангиллыг устгахдаа итгэлтэй байна уу? Үүнд хамаарах дэд ангиллууд устгагдах эрсдэлтэй.");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:3001/api/categories/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setCategoryList(categoryList.filter(c => c.id !== id));
                toast.success("Ангилал устгагдлаа");
            } else {
                toast.error("Устгахад алдаа гарлаа.");
            }
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Үйлчилгээний Ангилал</h1>
                    <p className="text-muted-foreground mt-1">Зураглаач, Зурагчин, Дрон, Эдит гэх мэт үндсэн үйлчилгээний бүлгүүд.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Ангилал үүсгэх
                </button>
            </div>

            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium border-b w-[80px]">ID</th>
                                <th className="px-6 py-4 font-medium border-b w-[200px]">Нэр</th>
                                <th className="px-6 py-4 font-medium border-b w-[120px]">Дэд ангилал</th>
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
                            ) : categoryList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        Одоогоор ангилал бүртгэгдээгүй байна.
                                    </td>
                                </tr>
                            ) : (
                                categoryList.map((category) => (
                                    <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{category.id}</td>
                                        <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                                            {category.icon && <span className="text-xl">{category.icon}</span>}
                                            {category.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                                                {category.subCategories?.length || 0} ширхэг
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[300px]" title={category.description}>
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
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
                            <h2 className="text-lg font-semibold">{editingCategory ? 'Ангилал засварлах' : 'Шинэ ангилал үүсгэх'}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full p-2 hover:bg-muted/50 transition-colors"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ангиллын нэр</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Зурагчин, Видеограф, Дрон..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Айкон / Эможи (Заавал биш)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="📸 эсвэл 🎥"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Тайлбар (Заавал биш)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Энэ ангилалд ямар үйлчилгээ орох тухай..."
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
