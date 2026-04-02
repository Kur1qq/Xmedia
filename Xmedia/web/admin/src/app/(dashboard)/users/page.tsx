"use client";

import { Download, Filter, Plus, History, X, CheckSquare, Square, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/auth";
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, TextRun } from 'docx';

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
    const [userBookings, setUserBookings] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (!historyModalUser) return;
        setLoadingHistory(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/bookings/user/${historyModalUser.id}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setUserBookings(Array.isArray(data) ? data : []))
            .catch(() => setUserBookings([]))
            .finally(() => setLoadingHistory(false));
    }, [historyModalUser]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/users`);
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

    const handleDeleteUser = async (id: string, username: string) => {
        if (!window.confirm(`Та "${username}" хэрэглэгчийг устгахдаа итгэлтэй байна уу?`)) return;
        
        try {
            const res = await fetchWithAuth(`/users/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
                toast.success('Хэрэглэгч амжилттай устгагдлаа!');
                setSelectedUserIds(prev => prev.filter(userId => userId !== id));
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err?.message || 'Хэрэглэгч устгахад алдаа гарлаа.');
            }
        } catch {
            toast.error('Сервертэй холбогдоход алдаа гарлаа.');
        }
    };

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

    const exportToExcel = (type: 'all' | 'selected') => {
        setIsExportMenuOpen(false);
        const usersToExport = type === 'all'
            ? users
            : users.filter(u => selectedUserIds.includes(u.id));

        if (usersToExport.length === 0) {
            toast.error("Татах хэрэглэгч алга байна.");
            return;
        }

        const exportData = usersToExport.map((u: any, index: number) => ({
            '№': index + 1,
            'Нэр': u.username || '-',
            'Имэйл': u.email || '-',
            'Утас': u.phone || '-',
            'Төлөв': 'Идэвхтэй',
            'Бүртгүүлсэн огноо': new Date(u.createdAt).toLocaleDateString('mn-MN'),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const colWidths = [
            { wch: 5 }, // №
            { wch: 25 }, // Username
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 15 }, // Status
            { wch: 20 }, // Date
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

        XLSX.writeFile(workbook, `Users_Export_${new Date().toLocaleDateString('mn-MN')}.xlsx`);
    };

    const exportToWord = async (type: 'all' | 'selected') => {
        setIsExportMenuOpen(false);
        const usersToExport = type === 'all'
            ? users
            : users.filter(u => selectedUserIds.includes(u.id));

        if (usersToExport.length === 0) {
            toast.error("Татах хэрэглэгч алга байна.");
            return;
        }

        const dateStr = new Date().toLocaleDateString('mn-MN');

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "Хэрэглэгчдийн жагсаалт",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Нийт: ${usersToExport.length} хэрэглэгч | Огноо: ${dateStr}`,
                        alignment: AlignmentType.RIGHT,
                    }),
                    new Paragraph({ text: "" }), // Spacing
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        columnWidths: [700, 2500, 3500, 1500, 1800], // Set explicit column widths in twips
                        rows: [
                            // Header Row
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "№", bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Нэр", bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Имэйл", bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Утас", bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Бүртгүүлсэн огноо", bold: true })] })] }),
                                ]
                            }),
                            // Data Rows
                            ...usersToExport.map((u: any, i: number) => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(String(i + 1))] }),
                                    new TableCell({ children: [new Paragraph(u.username || '-')] }),
                                    new TableCell({ children: [new Paragraph(u.email || '-')] }),
                                    new TableCell({ children: [new Paragraph(u.phone || '-')] }),
                                    new TableCell({ children: [new Paragraph(new Date(u.createdAt).toLocaleDateString('mn-MN'))] }),
                                ]
                            }))
                        ]
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Users_Export_${dateStr}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
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
                            <span className="hidden sm:inline">Экспорт (Татах)</span>
                            <ChevronDown size={14} className={`transition - transform ${isExportMenuOpen ? "rotate-180" : ""} `} />
                        </button>

                        {/* Dropdown Menu */}
                        {isExportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 border-b border-border">Excel (.xlsx) татах</div>
                                <button
                                    onClick={() => exportToExcel('all')}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                                >
                                    Бүх хэрэглэгчийг татах
                                </button>
                                <button
                                    onClick={() => exportToExcel('selected')}
                                    disabled={selectedUserIds.length === 0}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-b border-border"
                                >
                                    Сонгосноо татах ({selectedUserIds.length})
                                </button>

                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 border-b border-border">Word (.docx) татах</div>
                                <button
                                    onClick={() => exportToWord('all')}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                                >
                                    Бүх хэрэглэгчийг татах
                                </button>
                                <button
                                    onClick={() => exportToWord('selected')}
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
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.username)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-white hover:bg-red-600 rounded-md border border-red-500/20 transition-colors"
                                                        title="Устгах"
                                                    >
                                                        <X size={14} />
                                                        Устгах
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setIsAddUserModalOpen(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h2 className="text-lg font-semibold tracking-tight">Шинэ хэрэглэгч</h2>
                            <button onClick={() => !saving && setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <form id="add-user-form" onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Нэр <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        value={addForm.username}
                                        onChange={e => setAddForm({ ...addForm, username: e.target.value })}
                                        className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Ганбат Дорж"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Имэйл <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="email"
                                        value={addForm.email}
                                        onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                                        className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="ganbat@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Утас</label>
                                    <input
                                        type="text"
                                        value={addForm.phone}
                                        onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                                        className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="99001122"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Нууц үг <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="password"
                                        value={addForm.password}
                                        onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                                        className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button
                                type="button"
                                onClick={() => setIsAddUserModalOpen(false)}
                                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                            >
                                Цуцлах
                            </button>
                            <button
                                type="submit"
                                form="add-user-form"
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <span className="animate-pulse">Түр хүлээнэ үү...</span> : 'Хадгалах'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ТҮҮХ ХАРАХ MODAL --- */}
            {historyModalUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => { setHistoryModalUser(null); setUserBookings([]); }}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                                    <History size={18} className="text-primary" />
                                    Захиалгын түүх
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Хэрэглэгч: <span className="text-white font-medium">{historyModalUser.username}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => { setHistoryModalUser(null); setUserBookings([]); }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-0 overflow-x-auto max-h-[60vh] overflow-y-auto w-full">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-[10px] text-gray-500 uppercase bg-black/20 border-b border-white/5 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">Огноо</th>
                                        <th className="px-4 py-2 font-medium">Үйлчилгээ</th>
                                        <th className="px-4 py-2 font-medium">Төлбөр</th>
                                        <th className="px-4 py-2 font-medium">Төлөв</th>
                                        <th className="px-4 py-2 font-medium text-right">Үнэ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loadingHistory ? (
                                        <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Уншиж байна...</td></tr>
                                    ) : userBookings.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Захиалга олдсонгүй.</td></tr>
                                    ) : userBookings.map((b: any) => {
                                        const itemNames = (b.items || []).map((item: any) => {
                                            if (item.studio) return `Студи: ${item.studio.name}`;
                                            if (item.liveService) return `Live: ${item.liveService.name}`;
                                            if (item.photographerService) return `Зураглаач: ${item.photographerService.name}`;
                                            if (item.editService) return `Эдит: ${item.editService.name}`;
                                            if (item.service) return item.service.name;
                                            return item.itemType;
                                        }).join(', ');

                                        const statusMap: Record<string, { label: string; cls: string }> = {
                                            CONFIRMED: { label: 'Баталгаажсан', cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
                                            COMPLETED: { label: 'Дууссан', cls: 'bg-green-500/10 text-green-500 border-green-500/20' },
                                            CANCELLED: { label: 'Цуцлагдсан', cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
                                            PENDING: { label: 'Хүлээгдэж буй', cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
                                        };
                                        const paymentMap: Record<string, { label: string; cls: string }> = {
                                            PAID: { label: 'Төлөгдсөн', cls: 'bg-green-500/10 text-green-500 border-green-500/20' },
                                            UNPAID: { label: 'Төлөгдөөгүй', cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
                                            REFUNDED: { label: 'Буцаагдсан', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
                                        };
                                        const st = statusMap[b.status] || statusMap.PENDING;
                                        const pt = paymentMap[b.paymentStatus] || paymentMap.UNPAID;

                                        return (
                                            <tr key={b.id} className="hover:bg-white/5 transition-colors text-xs text-gray-300">
                                                <td className="px-4 py-3">{new Date(b.createdAt).toLocaleDateString('mn-MN')}</td>
                                                <td className="px-4 py-3 font-medium max-w-[200px] truncate">{itemNames || '—'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border uppercase tracking-wider ${pt.cls}`}>{pt.label}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border uppercase tracking-wider ${st.cls}`}>{st.label}</span>
                                                </td>
                                                <td className={`px-4 py-3 text-right font-medium ${b.status === 'CANCELLED' ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                                                    {Number(b.totalAmount).toLocaleString()}₮
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end mt-auto bg-black/20">
                            <button
                                onClick={() => { setHistoryModalUser(null); setUserBookings([]); }}
                                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
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
