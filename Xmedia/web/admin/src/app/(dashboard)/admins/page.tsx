"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, ShieldCheck, User, Image as ImageIcon, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth, getAdminInfo, getToken } from "@/lib/auth";

const ROLES: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: 'Дээд Админ', color: 'bg-red-500/10 text-red-400' },
    ADMIN: { label: 'Админ', color: 'bg-primary/10 text-primary' },
    MODERATOR: { label: 'Модератор', color: 'bg-blue-500/10 text-blue-400' },
    EDITOR: { label: 'Эдитор', color: 'bg-green-500/10 text-green-500' },
    CUSTOM: { label: 'Захиалгат', color: 'bg-violet-500/10 text-violet-400' },
};

interface PermissionRole { id: number; name: string; permissions: string[] }

export default function AdminsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [customRoles, setCustomRoles] = useState<PermissionRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModal, setIsModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState({ username: "", password: "", role: "ADMIN", image: "", isActive: true, customRoleId: "" });
    const [uploadingImg, setUploadingImg] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [me, setMe] = useState<ReturnType<typeof getAdminInfo>>(null);

    useEffect(() => { setMe(getAdminInfo()); }, []);

    const fetchAdmins = async () => {
        try {
            const res = await fetchWithAuth('/admin');
            if (res.ok) setAdmins(await res.json());
            else if (res.status === 401 || res.status === 403) { toast.error("Эрх байхгүй."); }
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setLoading(false); }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetchWithAuth('/admin/roles');
            if (res.ok) setCustomRoles(await res.json());
        } catch { /* silent */ }
    };

    useEffect(() => { fetchAdmins(); fetchRoles(); }, []);

    const openModal = (a: any = null) => {
        setEditing(a);
        setForm({
            username: a?.username || "",
            password: "",
            role: a?.role || "ADMIN",
            image: a?.image || "",
            isActive: a?.isActive ?? true,
            customRoleId: a?.customRoleId ? String(a.customRoleId) : "",
        });
        setIsModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadingImg(true);
        const fd = new FormData(); fd.append('file', file);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload`, { method: 'POST', headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) }, body: fd });
            if (res.ok) { const d = await res.json(); setForm(p => ({ ...p, image: d.url })); toast.success("Зураг хуулагдлаа!"); }
            else toast.error("Зураг хуулахад алдаа.");
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setUploadingImg(false); if (fileRef.current) fileRef.current.value = ''; }
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing && !form.password) { toast.error("Нууц үг оруулна уу!"); return; }
        if (form.role === 'CUSTOM' && !form.customRoleId) { toast.error("Захиалгат эрх сонгоно уу!"); return; }
        setSaving(true);
        const payload: any = {
            username: form.username,
            role: form.role,
            isActive: form.isActive,
            customRoleId: form.role === 'CUSTOM' ? Number(form.customRoleId) : null,
        };
        if (form.password) payload.password = form.password;
        if (form.image) payload.image = form.image;

        const res = await fetchWithAuth(editing ? `/admin/${editing.id}` : '/admin', {
            method: editing ? 'PATCH' : 'POST',
            body: JSON.stringify(payload),
        });
        if (res.ok) { await fetchAdmins(); setIsModal(false); toast.success("Хадгалагдлаа"); }
        else { const err = await res.json().catch(() => ({})); toast.error(err?.message || "Алдаа"); }
        setSaving(false);
    };

    const remove = async (id: number) => {
        if (id === me?.id) { toast.error("Өөрийгөө устгах боломжгүй."); return; }
        if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
        const res = await fetchWithAuth(`/admin/${id}`, { method: 'DELETE' });
        if (res.ok) { setAdmins(p => p.filter(a => a.id !== id)); toast.success("Устгагдлаа"); }
        else toast.error("Алдаа.");
    };

    const isSuperAdmin = me?.role === 'SUPER_ADMIN';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin удирдлага</h1>
                    <p className="text-muted-foreground mt-1">Системийн администраторуудыг удирдах хэсэг.</p>
                </div>
                {isSuperAdmin && (
                    <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Шинэ Админ нэмэх
                    </button>
                )}
            </div>

            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium border-b">Зураг</th>
                            <th className="px-6 py-4 font-medium border-b">Нэвтрэх нэр</th>
                            <th className="px-6 py-4 font-medium border-b">Эрх</th>
                            <th className="px-6 py-4 font-medium border-b">Төлөв</th>
                            <th className="px-6 py-4 font-medium border-b">Бүртгэгдсэн</th>
                            {isSuperAdmin && <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (<tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                            : admins.length === 0 ? (<tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Бүртгэл алга.</td></tr>)
                                : admins.map(a => (
                                    <tr key={a.id} className={`hover:bg-muted/30 transition-colors ${a.id === me?.id ? 'bg-primary/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            {a.image
                                                ? <img src={a.image} alt={a.username} className="w-10 h-10 rounded-full object-cover" />
                                                : <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><User className="w-5 h-5 text-muted-foreground" /></div>}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {a.username} {a.id === me?.id && <span className="text-xs text-primary ml-1">(Та)</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLES[a.role]?.color || 'bg-muted text-muted-foreground'}`}>
                                                {a.role === 'CUSTOM' ? <KeyRound className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                                {a.role === 'CUSTOM' && a.customRole
                                                    ? a.customRole.name
                                                    : ROLES[a.role]?.label || a.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {a.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs">{new Date(a.createdAt).toLocaleDateString('mn-MN')}</td>
                                        {isSuperAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => openModal(a)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                    {a.id !== me?.id && <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleImageUpload} />

            {isModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setIsModal(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h2 className="text-lg font-semibold tracking-tight">{editing ? 'Админ засах' : 'Шинэ Админ нэмэх'}</h2>
                            <button onClick={() => !saving && setIsModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <form id="admin-form" onSubmit={save} className="space-y-4">
                                {/* Avatar */}
                                <div className="flex items-center gap-4 mb-2">
                                    {form.image
                                        ? <img src={form.image} alt="" className="w-16 h-16 rounded-full object-cover border border-white/10 shadow-sm" />
                                        : <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center border border-white/5"><ImageIcon className="w-6 h-6 text-gray-500" /></div>}
                                    <button type="button" disabled={uploadingImg} onClick={() => fileRef.current?.click()} className="px-3 py-1.5 text-sm bg-black/20 border border-white/5 text-white rounded-md hover:border-white/20 transition-colors">
                                        {uploadingImg ? "Хуулж байна..." : "Зураг хуулах"}
                                    </button>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Нэвтрэх нэр <span className="text-red-500">*</span></label>
                                    <input required type="text" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="admin123" />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Нууц үг {editing && <span className="text-gray-600">(хоосон орхивол өөрчлөгдөхгүй)</span>}</label>
                                    <input type="password" className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Эрхийн түвшин</label>
                                    <select className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" value={form.role} onChange={e => setForm({ ...form, role: e.target.value, customRoleId: "" })}>
                                        <option value="MODERATOR">Модератор</option>
                                        <option value="EDITOR">Эдитор</option>
                                        <option value="ADMIN">Админ</option>
                                        <option value="SUPER_ADMIN">Дээд Админ</option>
                                        <option value="CUSTOM">Захиалгат эрх</option>
                                    </select>
                                </div>

                                {/* Custom role picker */}
                                {form.role === 'CUSTOM' && (
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Захиалгат эрх сонгох <span className="text-red-500">*</span></label>
                                        {customRoles.length === 0 ? (
                                            <p className="text-xs text-gray-500 p-2 rounded-md border border-dashed border-white/10 bg-black/10">
                                                Захиалгат эрх байхгүй. <a href="/roles" className="text-primary hover:underline">Эрх удирдлага</a>-аас нэмнэ үү.
                                            </p>
                                        ) : (
                                            <select
                                                required
                                                className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                value={form.customRoleId}
                                                onChange={e => setForm({ ...form, customRoleId: e.target.value })}
                                            >
                                                <option value="">-- Эрх сонгоно уу --</option>
                                                {customRoles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}

                                <label className="flex items-center gap-2 text-sm text-gray-300 mt-2 select-none cursor-pointer w-fit">
                                    <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Идэвхтэй
                                </label>
                            </form>
                        </div>

                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                                Болих
                            </button>
                            <button type="submit" form="admin-form" disabled={saving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving ? <span className="animate-pulse">Түр хүлээнэ үү...</span> : 'Хадгалах'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
