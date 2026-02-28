"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, ShieldCheck, User, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth, getAdminInfo } from "@/lib/auth";

const ROLES: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: 'Дээд Админ', color: 'bg-red-500/10 text-red-400' },
    ADMIN: { label: 'Админ', color: 'bg-primary/10 text-primary' },
    MODERATOR: { label: 'Модератор', color: 'bg-blue-500/10 text-blue-400' },
};

export default function AdminsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModal, setIsModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState({ username: "", password: "", role: "ADMIN", image: "", isActive: true });
    const [uploadingImg, setUploadingImg] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [me, setMe] = useState<ReturnType<typeof getAdminInfo>>(null);

    useEffect(() => {
        setMe(getAdminInfo());
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await fetchWithAuth('/admin');
            if (res.ok) setAdmins(await res.json());
            else if (res.status === 401 || res.status === 403) { toast.error("Эрх байхгүй."); }
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const openModal = (a: any = null) => {
        setEditing(a);
        setForm({ username: a?.username || "", password: "", role: a?.role || "ADMIN", image: a?.image || "", isActive: a?.isActive ?? true });
        setIsModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadingImg(true);
        const fd = new FormData(); fd.append('file', file);
        try {
            const res = await fetch('http://localhost:4000/api/upload', { method: 'POST', body: fd });
            if (res.ok) { const d = await res.json(); setForm(p => ({ ...p, image: d.url })); toast.success("Зураг хуулагдлаа!"); }
            else toast.error("Зураг хуулахад алдаа.");
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setUploadingImg(false); if (fileRef.current) fileRef.current.value = ''; }
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing && !form.password) { toast.error("Нууц үг оруулна уу!"); return; }
        setSaving(true);
        const payload: any = { username: form.username, role: form.role, isActive: form.isActive };
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
                                                <ShieldCheck className="w-3 h-3" /> {ROLES[a.role]?.label || a.role}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-lg border border-border/50 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">{editing ? 'Админ засах' : 'Шинэ Админ нэмэх'}</h2>
                            <button onClick={() => setIsModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                        </div>
                        <form onSubmit={save} className="space-y-4">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                {form.image
                                    ? <img src={form.image} alt="" className="w-16 h-16 rounded-full object-cover border border-border/50" />
                                    : <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border/50"><ImageIcon className="w-6 h-6 text-muted-foreground" /></div>}
                                <button type="button" disabled={uploadingImg} onClick={() => fileRef.current?.click()} className="px-3 py-1.5 text-sm bg-background border border-border/50 rounded-md hover:bg-muted">
                                    {uploadingImg ? "Хуулж байна..." : "Зураг хуулах"}
                                </button>
                            </div>

                            <div className="space-y-1"><label className="text-sm font-medium">Нэвтрэх нэр <span className="text-red-500">*</span></label>
                                <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="admin123" />
                            </div>
                            <div className="space-y-1"><label className="text-sm font-medium">Нууц үг {editing && <span className="text-muted-foreground text-xs">(хоосон орхивол өөрчлөгдөхгүй)</span>}</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="••••••••" />
                            </div>
                            <div className="space-y-1"><label className="text-sm font-medium">Эрхийн түвшин</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                    <option value="MODERATOR">Модератор</option>
                                    <option value="ADMIN">Админ</option>
                                    <option value="SUPER_ADMIN">Дээд Админ</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Идэвхтэй</label>
                            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                                <button type="button" onClick={() => setIsModal(false)} className="px-4 py-2 text-sm border border-border/50 rounded-md hover:bg-muted">Болих</button>
                                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">{saving ? 'Хадгалж байна...' : 'Хадгалах'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
