"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

const ACTION_LABELS: Record<string, string> = {
    // Auth
    LOGIN: 'Нэвтэрсэн',
    // Admin
    ADMIN_CREATE: 'Админ нэмсэн',
    ADMIN_UPDATE: 'Админ зассан',
    ADMIN_DELETE: 'Админ устгасан',
    // Studio
    STUDIO_CREATE: 'Студио нэмсэн',
    STUDIO_UPDATE: 'Студио зассан',
    STUDIO_DELETE: 'Студио устгасан',
    // Equipment
    EQUIPMENT_CREATE: 'Тоног төхөөрөмж нэмсэн',
    EQUIPMENT_UPDATE: 'Тоног төхөөрөмж зассан',
    EQUIPMENT_DELETE: 'Тоног төхөөрөмж устгасан',
    // Category
    CATEGORY_CREATE: 'Ангилал нэмсэн',
    CATEGORY_UPDATE: 'Ангилал зассан',
    CATEGORY_DELETE: 'Ангилал устгасан',
    // Live service
    LIVE_SERVICE_CREATE: 'Шууд дамжуулалт нэмсэн',
    LIVE_SERVICE_UPDATE: 'Шууд дамжуулалт зассан',
    LIVE_SERVICE_DELETE: 'Шууд дамжуулалт устгасан',
    // Photographer service & types
    PHOTOGRAPHER_SERVICE_CREATE: 'Зураглаач үйлчилгээ нэмсэн',
    PHOTOGRAPHER_SERVICE_UPDATE: 'Зураглаач үйлчилгээ зассан',
    PHOTOGRAPHER_SERVICE_DELETE: 'Зураглаач үйлчилгээ устгасан',
    PHOTOGRAPHER_TYPE_CREATE: 'Зураглаач төрөл нэмсэн',
    PHOTOGRAPHER_TYPE_UPDATE: 'Зураглаач төрөл зассан',
    PHOTOGRAPHER_TYPE_DELETE: 'Зураглаач төрөл устгасан',
    PHOTOGRAPHER_SUBTYPE_CREATE: 'Зураглаач дэд төрөл нэмсэн',
    PHOTOGRAPHER_SUBTYPE_UPDATE: 'Зураглаач дэд төрөл зассан',
    PHOTOGRAPHER_SUBTYPE_DELETE: 'Зураглаач дэд төрөл устгасан',
    // Edit service & types
    EDIT_SERVICE_CREATE: 'Эдит үйлчилгээ нэмсэн',
    EDIT_SERVICE_UPDATE: 'Эдит үйлчилгээ зассан',
    EDIT_SERVICE_DELETE: 'Эдит үйлчилгээ устгасан',
    EDIT_TYPE_CREATE: 'Эдит төрөл нэмсэн',
    EDIT_TYPE_UPDATE: 'Эдит төрөл зассан',
    EDIT_TYPE_DELETE: 'Эдит төрөл устгасан',
    EDIT_SUBTYPE_CREATE: 'Эдит дэд төрөл нэмсэн',
    EDIT_SUBTYPE_UPDATE: 'Эдит дэд төрөл зассан',
    EDIT_SUBTYPE_DELETE: 'Эдит дэд төрөл устгасан',
    // Bookings
    BOOKING_STATUS_UPDATE: 'Захиалгын төлөв өөрчилсөн',
};

const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: 'text-red-400',
    ADMIN: 'text-primary',
    MODERATOR: 'text-blue-400',
};

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterAction, setFilterAction] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth('/admin/logs?limit=200');
            if (res.ok) setLogs(await res.json());
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, []);

    const filtered = logs.filter(l => {
        const matchSearch = !search || l.admin?.username?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase()) || l.detail?.toLowerCase().includes(search.toLowerCase());
        const matchAction = !filterAction || l.action === filterAction;
        return matchSearch && matchAction;
    });

    const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Системийн лог</h1>
                    <p className="text-muted-foreground mt-1">Админуудын үйлдлийн түүх</p>
                </div>
                <button onClick={fetchLogs} className="inline-flex items-center gap-2 rounded-md border border-border/50 px-3 py-2 text-sm hover:bg-muted transition-colors">
                    <RefreshCw className="w-4 h-4" /> Шинэчлэх
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Хайх (нэр, үйлдэл...)" className="w-full pl-9 h-9 rounded-md border border-input bg-background text-sm pr-3" />
                </div>
                <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm min-w-[180px]">
                    <option value="">Бүх үйлдэл</option>
                    {uniqueActions.map(a => <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>)}
                </select>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Нийт: <strong className="text-foreground">{logs.length}</strong></span>
                {filtered.length !== logs.length && <span>· Шүүсэн: <strong className="text-foreground">{filtered.length}</strong></span>}
            </div>

            {/* Table */}
            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-4 py-4 font-medium border-b w-[160px]">Огноо / Цаг</th>
                                <th className="px-4 py-4 font-medium border-b w-[160px]">Админ</th>
                                <th className="px-4 py-4 font-medium border-b w-[180px]">Үйлдэл</th>
                                <th className="px-4 py-4 font-medium border-b">Объект</th>
                                <th className="px-4 py-4 font-medium border-b">Дэлгэрэнгүй</th>
                                <th className="px-4 py-4 font-medium border-b w-[120px]">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (<tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                : filtered.length === 0 ? (<tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Лог бүртгэл байхгүй байна.</td></tr>)
                                    : filtered.map(log => (
                                        <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString('mn-MN')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {log.admin?.image
                                                        ? <img src={log.admin.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                        : <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{log.admin?.username?.[0]?.toUpperCase()}</div>}
                                                    <div>
                                                        <p className="font-medium text-xs">{log.admin?.username || '?'}</p>
                                                        <p className={`text-xs ${ROLE_COLORS[log.admin?.role] || 'text-muted-foreground'}`}>{log.admin?.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${log.action === 'LOGIN' ? 'bg-green-500/10 text-green-500' :
                                                    log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400' :
                                                        log.action.includes('CREATE') ? 'bg-blue-500/10 text-blue-400' :
                                                            'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    {ACTION_LABELS[log.action] || log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                                {log.entity && <span>{log.entity}{log.entityId ? ` id-${log.entityId}` : ''}</span>}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{log.detail || '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{log.ip || '—'}</td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
