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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setIsModal(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h2 className="text-lg font-semibold tracking-tight">{editing ? "Эрх засах" : "Шинэ эрх нэмэх"}</h2>
                            <button onClick={() => !saving && setIsModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <form id="role-form" onSubmit={save} className="space-y-5">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Эрхийн нэр <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Жишээ: Студио менежер"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs text-gray-500 block">Хандах хуудсууд <span className="text-red-500">*</span></label>
                                        <button type="button" onClick={toggleAll} className="text-xs text-primary hover:underline">
                                            {ALL_PAGES.every(p => form.permissions.includes(p.href)) ? "Цуцлах" : "Бүгдийг сонгох"}
                                        </button>
                                    </div>
                                    <div className="rounded-lg border border-white/10 divide-y divide-white/5 bg-black/10">
                                        {ALL_PAGES.map(page => {
                                            const checked = form.permissions.includes(page.href);
                                            return (
                                                <div
                                                    key={page.href}
                                                    onClick={() => togglePage(page.href)}
                                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
                                                >
                                                    <span className={`shrink-0 ${checked ? 'text-primary' : 'text-gray-600'}`}>
                                                        {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                    </span>
                                                    <span className="text-sm text-gray-200">{page.label}</span>
                                                    <span className="ml-auto text-[10px] text-gray-500 font-mono">{page.href}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-gray-500">{form.permissions.length} хуудас сонгогдсон</p>
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                                Болих
                            </button>
                            <button type="submit" form="role-form" disabled={saving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving ? <span className="animate-pulse">Түр хүлээнэ...</span> : "Хадгалах"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
