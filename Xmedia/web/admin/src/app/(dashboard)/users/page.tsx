"use client";

import { Download, Filter, Plus, History, X, CheckSquare, Square, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/auth";

const EMPTY_FORM = { username: "", email: "", phone: "", password: "" };

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    // Modals state
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [historyModalUser, setHistoryModalUser] = useState<any | null>(null);
    const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/users');
            if (res.ok) setUsers(await res.json());
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };




    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addForm.username.trim() || !addForm.email.trim() || !addForm.password.trim()) {
            toast.error("Нэр, имэйл, нууц үг заавал оруулах ёстой!");
            return;
        }
        setSaving(true);
        try {
            // Hash password client-side via SubtleCrypto
            const enc = new TextEncoder();
            const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(addForm.password));
            const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

            const res = await fetchWithAuth('/users', {
                method: 'POST',
                body: JSON.stringify({
                    username: addForm.username.trim(),
                    email: addForm.email.trim(),
                    phone: addForm.phone.trim() || undefined,
                    passwordHash,
                }),
            });
            if (res.ok) {
                const newUser = await res.json();
                setUsers(prev => [...prev, newUser]);
                setIsAddUserModalOpen(false);
                setAddForm({ ...EMPTY_FORM });
                toast.success('Хэрэглэгч амжилттай нэмэгдлээ!');
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err?.message || 'Хэрэглэгч нэмэхэд алдаа гарлаа.');
            }
        } catch {
            toast.error('Сервертэй холбогдоход алдаа гарлаа.');
        } finally {
            setSaving(false);
        }
    };

    const openAddModal = () => { setAddForm({ ...EMPTY_FORM }); setIsAddUserModalOpen(true); };

    // Close export menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSelectAll = () => {
        if (selectedUserIds.length === users.length && users.length > 0) {
            setSelectedUserIds([]); // Deselect all
        } else {
            setSelectedUserIds(users.map(u => u.id)); // Select all
        }
    };

    const toggleSelectUser = (id: string) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(selectedUserIds.filter(userId => userId !== id));
        } else {
            setSelectedUserIds([...selectedUserIds, id]);
        }
    };

    const exportToPDF = async (type: 'all' | 'selected') => {
        setIsExportMenuOpen(false);
        const usersToExport = type === 'all'
            ? users
            : users.filter(u => selectedUserIds.includes(u.id));

        if (usersToExport.length === 0) {
            alert("Татах хэрэглэгч алга байна.");
            return;
        }

        // Dynamically import html2pdf only on the client side
        // @ts-ignore
        const html2pdf = (await import('html2pdf.js')).default;

        // 1. Create a temporary HTML element to hold the table for PDF structure
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'sans-serif';

        // 2. Build the HTML string
        let htmlStr = `
            <div style="color: #000; background-color: #fff; padding: 20px;">
                <h2 style="text-align: center; margin-bottom: 20px; color: #000;">Хэрэглэгчдийн жагсаалт</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #000;">
                    <thead>
                        <tr style="background-color: #f3f4f6; text-align: left; color: #000;">
                            <th style="padding: 10px; border: 1px solid #e5e7eb; color: #000;">Нэр</th>
                            <th style="padding: 10px; border: 1px solid #e5e7eb; color: #000;">Имэйл</th>
                            <th style="padding: 10px; border: 1px solid #e5e7eb; color: #000;">Утас</th>
                            <th style="padding: 10px; border: 1px solid #e5e7eb; color: #000;">Бүртгүүлсэн огноо</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        usersToExport.forEach(user => {
            const date = new Date(user.createdAt).toLocaleDateString('mn-MN');
            htmlStr += `
                <tr style="color: #000;">
                    <td style="padding: 10px; border: 1px solid #e5e7eb; color: #000;">${user.username || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; color: #000;">${user.email || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; color: #000;">${user.phone || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; color: #000;">${date}</td>
                </tr>
            `;
        });

        htmlStr += `
                </tbody>
            </table>
            <p style="text-align: right; font-size: 10px; color: #6b7280; margin-top: 20px;">
                Нийт татсан: ${usersToExport.length} хэрэглэгч | Огноо: ${new Date().toLocaleDateString('mn-MN')}
            </p>
            </div>
        `;

        container.innerHTML = htmlStr;

        // 3. Configure html2pdf options
        const opt = {
            margin: 10,
            filename: `users-export-${new Date().getTime()}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        // 4. Generate & Download
        html2pdf().set(opt).from(container).save();
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Хэрэглэгчид</h1>
                    <p className="text-muted-foreground mt-1">Системийн нийт хэрэглэгчдийн жагсаалт болон удирдлага.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Экспорт Dropdown Button */}
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Экспорт (PDF)</span>
                            <ChevronDown size={14} className={`transition - transform ${isExportMenuOpen ? "rotate-180" : ""} `} />
                        </button>

                        {/* Dropdown Menu */}
                        {isExportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-150">
                                <button
                                    onClick={() => exportToPDF('all')}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                                >
                                    Бүх хэрэглэгчийг татах
                                </button>
                                <button
                                    onClick={() => exportToPDF('selected')}
                                    disabled={selectedUserIds.length === 0}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-t border-border"
                                >
                                    Сонгосноо татах ({selectedUserIds.length})
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={16} />
                        <span>Шинэ хэрэглэгч</span>
                    </button>
                </div>
            </div>

            {/* Filters and Table wrapper */}
            <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="p-4 border-b border-border flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-sm">
                        <input
                            type="text"
                            placeholder="Хэрэглэгч хайх (нэр, имэйл)..."
                            className="w-full bg-muted/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground text-foreground"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg border border-transparent transition-colors text-sm font-medium text-foreground">
                        <Filter size={16} className="text-muted-foreground" />
                        <span className="hidden sm:inline">Шүүлтүүр</span>
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium w-10">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-muted-foreground hover:text-foreground transition-colors outline-none"
                                    >
                                        {users.length > 0 && selectedUserIds.length === users.length ? (
                                            <CheckSquare size={18} className="text-primary" />
                                        ) : (
                                            <Square size={18} />
                                        )}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-4 font-medium">Нэр</th>
                                <th scope="col" className="px-6 py-4 font-medium">Имэйл</th>
                                <th scope="col" className="px-6 py-4 font-medium">Утас</th>
                                <th scope="col" className="px-6 py-4 font-medium">Төлөв</th>
                                <th scope="col" className="px-6 py-4 font-medium">Бүртгүүлсэн</th>
                                <th scope="col" className="px-6 py-4 text-right font-medium">Үйлдэл</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                                        Уншиж байна...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                                        Хэрэглэгч олдсонгүй
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: any) => {
                                    const isSelected = selectedUserIds.includes(user.id);

                                    return (
                                        <tr key={user.id} className={`hover: bg - muted / 30 transition - colors group ${isSelected ? 'bg-primary/5' : ''} `}>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleSelectUser(user.id)}
                                                    className="text-muted-foreground hover:text-foreground transition-colors outline-none"
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare size={18} className="text-primary" />
                                                    ) : (
                                                        <Square size={18} />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase tracking-wider">
                                                        {user.username ? user.username.charAt(0) : 'U'}
                                                    </div>
                                                    {user.username}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                            <td className="px-6 py-4 text-foreground">{user.phone || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                    Идэвхтэй
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString('mn-MN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setHistoryModalUser(user)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary/90 rounded-md border border-primary/20 transition-colors"
                                                        title="Захиалгын түүх харах"
                                                    >
                                                        <History size={14} />
                                                        Түүх
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                    <div>Нийт {users.length} хэрэглэгч байна.</div>
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1 rounded border border-border opacity-50 cursor-not-allowed">Өмнөх</button>
                        <button className="px-3 py-1 rounded bg-primary text-primary-foreground font-medium">1</button>
                        <button className="px-3 py-1 rounded border border-border hover:bg-muted transition-colors opacity-50 cursor-not-allowed">Дараах</button>
                    </div>
                </div>
            </div>

            {/* --- ШИНЭ ХЭРЭГЛЭГЧ НЭМЭХ MODAL --- */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Шинэ хэрэглэгч</h3>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Нэр <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        value={addForm.username}
                                        onChange={e => setAddForm({ ...addForm, username: e.target.value })}
                                        className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="Ганбат Дорж"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Имэйл <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="email"
                                        value={addForm.email}
                                        onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                                        className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="ganbat@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Утас</label>
                                    <input
                                        type="text"
                                        value={addForm.phone}
                                        onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                                        className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="99001122"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Нууц үг <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="password"
                                        value={addForm.password}
                                        onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                                        className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUserModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                                >
                                    Цуцлах
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                                >
                                    {saving ? 'Хадгалж байна...' : 'Хадгалах'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ТҮҮХ ХАРАХ MODAL --- */}
            {historyModalUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <History size={18} className="text-primary" />
                                    Захиалгын түүх
                                </h3>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Хэрэглэгч: <span className="text-foreground font-medium">{historyModalUser.username}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setHistoryModalUser(null)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Огноо</th>
                                        <th className="px-6 py-3 font-medium">Үйлчилгээ</th>
                                        <th className="px-6 py-3 font-medium">Төлөв</th>
                                        <th className="px-6 py-3 font-medium text-right">Үнэ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {/* Placeholder data (Backend холбоогүй тул dummy харуулж байна) */}
                                    <tr className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">2026.02.25</td>
                                        <td className="px-6 py-4 font-medium">Шууд дамжуулалт (2 цаг)</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                                                Баталгаажсан
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-foreground">500,000₮</td>
                                    </tr>
                                    <tr className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">2026.02.10</td>
                                        <td className="px-6 py-4 font-medium">Студи түрээс (1 цаг)</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border uppercase tracking-wider">
                                                Дууссан
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-foreground">45,000₮</td>
                                    </tr>
                                    <tr className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">2026.01.05</td>
                                        <td className="px-6 py-4 font-medium">Лого анимаци эдит</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
                                                Цуцлагдсан
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-muted-foreground line-through">120,000₮</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
                            <button
                                onClick={() => setHistoryModalUser(null)}
                                className="px-4 py-2 text-sm font-medium bg-background border border-border hover:bg-muted rounded-lg transition-colors"
                            >
                                Хаах
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
