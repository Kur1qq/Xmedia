"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2, KeyRound, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth, getAdminInfo } from "@/lib/auth";

const ALL_PAGES = [
    { href: "/", label: "Нүүр" },
    { href: "/users", label: "Хэрэглэгчид" },
    { href: "/bookings", label: "Захиалга" },
    { href: "/studio", label: "Студио" },
    { href: "/live", label: "Шууд дамжуулалт" },
    { href: "/photographer", label: "Зураглаач" },
    { href: "/edit", label: "Эдит" },
    { href: "/portfolio", label: "Өмнөх ажлууд" },
    { href: "/admins", label: "Админ удирдлага" },
    { href: "/logs", label: "Системийн лог" },
    { href: "/settings", label: "Тохиргоо" },
];

interface PermissionRole {
    id: number;
    name: string;
    permissions: string[];
    createdAt: string;
    _count?: { admins: number };
}

const EMPTY_FORM = { name: "", permissions: ["/"] as string[] };

export default function RolesPage() {
    const [roles, setRoles] = useState<PermissionRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModal, setIsModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<PermissionRole | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const me = getAdminInfo();

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth("/admin/roles");
            if (res.ok) setRoles(await res.json());
            else toast.error("Эрхүүдийг унших амжилтгүй боллоо.");
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRoles(); }, []);

    const openModal = (role: PermissionRole | null = null) => {
        setEditing(role);
        setForm(role
            ? { name: role.name, permissions: Array.isArray(role.permissions) ? role.permissions : [] }
            : { ...EMPTY_FORM }
        );
        setIsModal(true);
    };

    const togglePage = (href: string) => {
        setForm(prev => {
            const has = prev.permissions.includes(href);
            if (has && prev.permissions.length === 1) return prev;
            return {
                ...prev,
                permissions: has
                    ? prev.permissions.filter(p => p !== href)
                    : [...prev.permissions, href],
            };
        });
    };

    const toggleAll = () => {
        const allSelected = ALL_PAGES.every(p => form.permissions.includes(p.href));
        setForm(prev => ({
            ...prev,
            permissions: allSelected ? ["/"] : ALL_PAGES.map(p => p.href),
        }));
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("Нэр оруулна уу!"); return; }
        if (form.permissions.length === 0) { toast.error("Дор хаяж нэг хуудс сонгоно уу!"); return; }
        setSaving(true);
        const res = await fetchWithAuth(editing ? `/admin/roles/${editing.id}` : "/admin/roles", {
            method: editing ? "PATCH" : "POST",
            body: JSON.stringify({ name: form.name.trim(), permissions: form.permissions }),
        });
        if (res.ok) {
            await fetchRoles();
            setIsModal(false);
            toast.success(editing ? "Эрх шинэчлэгдлэ" : "Эрх үүслэ");
        } else {
            const err = await res.json().catch(() => ({}));
            toast.error(err?.message || "Алдаа гарлаа");
        }
        setSaving(false);
    };

    const remove = async (role: PermissionRole) => {
        if (!confirm(`"${role.name}" эрхийг устгахдаа итгэлтэй байна уу? Тухайн эрхтэй ${role._count?.admins ?? 0} админд нөлөөлнө.`)) return;
        const res = await fetchWithAuth(`/admin/roles/${role.id}`, { method: "DELETE" });
        if (res.ok) { setRoles(p => p.filter(r => r.id !== role.id)); toast.success("Устгагдлаа"); }
        else toast.error("Устгах амжилтгүй боллоо.");
    };

    const isSuperAdmin = me?.role === "SUPER_ADMIN";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Эрх удирдлага</h1>
                    <p className="text-muted-foreground mt-1">Захиалгат эрхүүдийг үүсгэж хуудасны хандалтыг тохируулах.</p>
                </div>
                {isSuperAdmin && (
                    <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Шинэ эрх нэмэх
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium border-b">Эрхийн нэр</th>
                            <th className="px-6 py-4 font-medium border-b">Хандах хуудсууд</th>
                            <th className="px-6 py-4 font-medium border-b">Админ тоо</th>
                            <th className="px-6 py-4 font-medium border-b">Үүсгэсэн огноо</th>
                            {isSuperAdmin && <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Уншиж байна...</td></tr>
                        ) : roles.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-16 text-center">
                                    <KeyRound className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                                    <p className="text-muted-foreground text-sm">Захиалгат эрх байхгүй байна.</p>
                                    {isSuperAdmin && (
                                        <button onClick={() => openModal()} className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                                            <Plus className="h-3.5 w-3.5" /> Эрх үүсгэх
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : roles.map(role => (
                            <tr key={role.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <KeyRound className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="font-medium">{role.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                                        {(Array.isArray(role.permissions) ? role.permissions : []).map(href => {
                                            const page = ALL_PAGES.find(p => p.href === href);
                                            return (
                                                <span key={href} className="inline-flex rounded-full bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5">
                                                    {page?.label ?? href}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                                        {role._count?.admins ?? 0} админ
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground text-xs">
                                    {new Date(role.createdAt).toLocaleDateString("mn-MN")}
                                </td>
                                {isSuperAdmin && (
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => openModal(role)} className="text-muted-foreground hover:text-primary">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => remove(role)} className="text-muted-foreground hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 text-sm text-muted-foreground">
                    Нийт {roles.length} захиалгат эрх байна.
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-xl border border-border/50 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-semibold">{editing ? "Эрх засах" : "Шинэ эрх нэмэх"}</h2>
                            <button onClick={() => setIsModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                        </div>

                        <form onSubmit={save} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Эрхийн нэр <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                                    placeholder="Жишээ: Студио менежер"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Хандах хуудсууд <span className="text-red-500">*</span></label>
                                    <button type="button" onClick={toggleAll} className="text-xs text-primary hover:underline">
                                        {ALL_PAGES.every(p => form.permissions.includes(p.href)) ? "Цуцлах" : "Бүгдийг сонгох"}
                                    </button>
                                </div>
                                <div className="rounded-lg border border-border/50 divide-y divide-border/30">
                                    {ALL_PAGES.map(page => {
                                        const checked = form.permissions.includes(page.href);
                                        return (
                                            <div
                                                key={page.href}
                                                onClick={() => togglePage(page.href)}
                                                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                                            >
                                                <span className={`shrink-0 ${checked ? 'text-primary' : 'text-muted-foreground/50'}`}>
                                                    {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                </span>
                                                <span className="text-sm">{page.label}</span>
                                                <span className="ml-auto text-xs text-muted-foreground font-mono">{page.href}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">{form.permissions.length} хуудас сонгогдсон</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                                <button type="button" onClick={() => setIsModal(false)} className="px-4 py-2 text-sm border border-border/50 rounded-md hover:bg-muted">Болих</button>
                                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-60">
                                    {saving ? "Хадгалж байна..." : "Хадгалах"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
