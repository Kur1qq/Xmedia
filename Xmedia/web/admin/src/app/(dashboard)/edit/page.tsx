"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Pencil, Trash2, Image as ImageIcon, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import * as Tabs from '@radix-ui/react-tabs';
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const tabCls = "px-5 h-[45px] flex items-center justify-center text-sm font-medium leading-none text-muted-foreground select-none hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary outline-none cursor-pointer transition-colors";

interface ServicePackage {
    id: string;
    subTypeId: string;
    price: string;
    priceLabel: string;
}

export default function EditPage() {
    const [loading, setLoading] = useState(true);

    // --- CATEGORY ---
    const [categories, setCategories] = useState<any[]>([]);
    const [isCatModal, setIsCatModal] = useState(false);
    const [savingCat, setSavingCat] = useState(false);
    const [editingCat, setEditingCat] = useState<any | null>(null);
    const [catForm, setCatForm] = useState({ name: "", description: "" });

    // --- MAIN TYPE ---
    const [mainTypes, setMainTypes] = useState<any[]>([]);
    const [isMainModal, setIsMainModal] = useState(false);
    const [savingMain, setSavingMain] = useState(false);
    const [editingMain, setEditingMain] = useState<any | null>(null);
    const [mainForm, setMainForm] = useState({ name: "", description: "", sortOrder: "0" });
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    // --- SUB TYPE ---
    const [isSubModal, setIsSubModal] = useState(false);
    const [savingSub, setSavingSub] = useState(false);
    const [editingSub, setEditingSub] = useState<any | null>(null);
    const [subForm, setSubForm] = useState({ name: "", description: "", sortOrder: "0", mainTypeId: "" });

    // --- SERVICE ---
    const [services, setServices] = useState<any[]>([]);
    const [isSvcModal, setIsSvcModal] = useState(false);
    const [savingSvc, setSavingSvc] = useState(false);
    const [editingSvc, setEditingSvc] = useState<any | null>(null);
    const [svcForm, setSvcForm] = useState({
        name: "", categoryId: "", mainTypeId: "", description: "", image: "", isActive: true,
        packages: [] as ServicePackage[],
        amenities: [] as string[]
    });

    const filteredSubTypes = mainTypes.find(m => m.id === parseInt(svcForm.mainTypeId))?.subTypes || [];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingImg, setUploadingImg] = useState(false);

    const fetchData = async () => {
        try {
            const [rCats, rSvcs, rMains] = await Promise.all([
                fetch(`${API}/categories`),
                fetch(`${API}/edit-services`),
                fetch(`${API}/edit-types/main`),
            ]);
            if (rCats.ok) setCategories(await rCats.json());
            if (rSvcs.ok) setServices(await rSvcs.json());
            if (rMains.ok) setMainTypes(await rMains.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadingImg(true);
        const fd = new FormData(); fd.append('file', file);
        try {
            const res = await fetch(`${API}/upload`, {
                method: 'POST',
                headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
                body: fd
            });
            if (res.ok) { const d = await res.json(); setSvcForm(p => ({ ...p, image: d.url })); toast.success("Зураг хуулагдлаа!"); }
            else toast.error("Зураг хуулахад алдаа.");
        } catch { toast.error("Сервертэй алдаа."); }
        finally { setUploadingImg(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    // ======= CATEGORY =======
    const openCatModal = (c: any = null) => { setEditingCat(c); setCatForm({ name: c?.name || "", description: c?.description || "" }); setIsCatModal(true); };
    const saveCat = async (e: React.FormEvent) => {
        e.preventDefault(); setSavingCat(true);
        const url = editingCat ? `${API}/categories/${editingCat.id}` : `${API}/categories`;
        const res = await fetch(url, { method: editingCat ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) });
        if (res.ok) { await fetchData(); setIsCatModal(false); toast.success("Хадгалагдлаа"); } else toast.error("Алдаа");
        setSavingCat(false);
    };
    const deleteCat = async (id: number) => {
        if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
        const res = await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
        if (res.ok) { setCategories(p => p.filter(c => c.id !== id)); toast.success("Устгагдлаа"); } else toast.error("Алдаа");
    };

    // ======= MAIN TYPE =======
    const openMainModal = (mt: any = null) => { setEditingMain(mt); setMainForm({ name: mt?.name || "", description: mt?.description || "", sortOrder: mt?.sortOrder?.toString() || "0" }); setIsMainModal(true); };
    const saveMain = async (e: React.FormEvent) => {
        e.preventDefault(); setSavingMain(true);
        const url = editingMain ? `${API}/edit-types/main/${editingMain.id}` : `${API}/edit-types/main`;
        const res = await fetch(url, { method: editingMain ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: mainForm.name, description: mainForm.description || undefined, sortOrder: parseInt(mainForm.sortOrder) || 0 }) });
        if (res.ok) { await fetchData(); setIsMainModal(false); toast.success("Хадгалагдлаа"); } else toast.error("Алдаа");
        setSavingMain(false);
    };
    const deleteMain = async (id: number) => {
        if (!confirm("Устгавал дагалдах дэд төрлүүд устгагдана. Итгэлтэй байна уу?")) return;
        const res = await fetch(`${API}/edit-types/main/${id}`, { method: 'DELETE' });
        if (res.ok) { await fetchData(); toast.success("Устгагдлаа"); } else toast.error("Алдаа");
    };

    // ======= SUB TYPE =======
    const openSubModal = (mainTypeId: number, st: any = null) => { setEditingSub(st); setSubForm({ name: st?.name || "", description: st?.description || "", sortOrder: st?.sortOrder?.toString() || "0", mainTypeId: (st?.mainTypeId || mainTypeId).toString() }); setIsSubModal(true); };
    const saveSub = async (e: React.FormEvent) => {
        e.preventDefault(); setSavingSub(true);
        const url = editingSub ? `${API}/edit-types/sub/${editingSub.id}` : `${API}/edit-types/sub`;
        const payload = { name: subForm.name, description: subForm.description || undefined, sortOrder: parseInt(subForm.sortOrder) || 0, mainTypeId: parseInt(subForm.mainTypeId) };
        const res = await fetch(url, { method: editingSub ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { await fetchData(); setIsSubModal(false); toast.success("Хадгалагдлаа"); } else toast.error("Алдаа");
        setSavingSub(false);
    };
    const deleteSub = async (id: number) => {
        if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
        const res = await fetch(`${API}/edit-types/sub/${id}`, { method: 'DELETE' });
        if (res.ok) { await fetchData(); toast.success("Устгагдлаа"); } else toast.error("Алдаа");
    };

    // ======= SERVICE =======
    const openSvcModal = (s: any = null) => {
        setEditingSvc(s);

        const pkgs = s?.packages?.map((p: any) => ({
            id: p.id?.toString() || Date.now().toString() + Math.random(),
            subTypeId: p.subTypeId?.toString() || "",
            price: p.price?.toString() || "",
            priceLabel: p.priceLabel || "",
        })) || [{ id: Date.now().toString(), subTypeId: "", price: "", priceLabel: "" }];

        setSvcForm({
            name: s?.name || "",
            categoryId: s?.categoryId?.toString() || categories[0]?.id?.toString() || "",
            mainTypeId: s?.mainTypeId?.toString() || "",
            description: s?.description || "",
            image: s?.image || "",
            isActive: s?.isActive ?? true,
            packages: pkgs,
            amenities: Array.isArray(s?.amenities) ? s.amenities : (s?.amenities ? [s.amenities] : []),
        });
        setIsSvcModal(true);
    };

    const addPackage = () => {
        setSvcForm(prev => ({
            ...prev,
            packages: [...prev.packages, { id: Date.now().toString() + Math.random(), subTypeId: "", price: "", priceLabel: "" }]
        }));
    };

    const removePackage = (idx: number) => {
        setSvcForm(prev => ({
            ...prev,
            packages: prev.packages.filter((_, i) => i !== idx)
        }));
    };

    const updatePackage = (idx: number, field: keyof ServicePackage, value: string) => {
        setSvcForm(prev => {
            const newPackages = [...prev.packages];
            newPackages[idx] = { ...newPackages[idx], [field]: value };
            return { ...prev, packages: newPackages };
        });
    };

    const addAmenity = (val: string) => {
        if (!val.trim()) return;
        setSvcForm(prev => ({ ...prev, amenities: [...prev.amenities, val.trim()] }));
    };

    const removeAmenity = (index: number) => {
        setSvcForm(prev => ({ ...prev, amenities: prev.amenities.filter((_, i) => i !== index) }));
    };

    const saveSvc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!svcForm.categoryId) { toast.error("Ангилал сонгоно уу!"); return; }
        if (!svcForm.mainTypeId) { toast.error("Үндсэн төрөл сонгоно уу!"); return; }

        const validPackages = svcForm.packages.filter(p => p.subTypeId && p.price);
        if (validPackages.length === 0) {
            toast.error("Дор хаяж нэг үнийн багц оруулна уу!");
            return;
        }

        setSavingSvc(true);
        const url = editingSvc ? `${API}/edit-services/${editingSvc.id}` : `${API}/edit-services`;
        const payload = {
            name: svcForm.name,
            categoryId: parseInt(svcForm.categoryId),
            mainTypeId: parseInt(svcForm.mainTypeId),
            description: svcForm.description || undefined,
            image: svcForm.image || undefined,
            isActive: svcForm.isActive,
            packages: validPackages.map(p => ({
                subTypeId: parseInt(p.subTypeId),
                price: parseFloat(p.price),
                priceLabel: p.priceLabel || undefined
            })),
            amenities: svcForm.amenities,
        };
        const res = await fetch(url, { method: editingSvc ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { await fetchData(); setIsSvcModal(false); toast.success("Хадгалагдлаа"); } else { const err = await res.json().catch(() => ({})); toast.error(err?.message || "Алдаа"); }
        setSavingSvc(false);
    };
    const deleteSvc = async (id: number) => {
        if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
        const res = await fetch(`${API}/edit-services/${id}`, { method: 'DELETE' });
        if (res.ok) { setServices(p => p.filter(s => s.id !== id)); toast.success("Устгагдлаа"); } else toast.error("Алдаа");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Эдит</h1>
                <p className="text-muted-foreground mt-1">Эдит үйлчилгээ, төрлүүд болон ангиллыг удирдах хэсэг.</p>
            </div>

            <Tabs.Root defaultValue="services" className="flex flex-col w-full">
                <Tabs.List className="flex shrink-0 border-b border-border/50 bg-background" aria-label="Edit Tabs">
                    <Tabs.Trigger value="services" className={tabCls}>Үйлчилгээ</Tabs.Trigger>
                    <Tabs.Trigger value="types" className={tabCls}>Төрлүүд</Tabs.Trigger>
                    <Tabs.Trigger value="categories" className={tabCls}>Ангилал</Tabs.Trigger>
                </Tabs.List>

                {/* ========= SERVICES TAB ========= */}
                <Tabs.Content value="services" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Эдит үйлчилгээ</h2>
                        <button onClick={() => openSvcModal()} disabled={mainTypes.length === 0} title={mainTypes.length === 0 ? 'Эхлээд Төрлүүд нэмнэ үү' : ''} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            <Plus className="h-4 w-4" /> Үйлчилгээ нэмэх
                        </button>
                    </div>
                    {mainTypes.length === 0 && !loading && (
                        <div className="text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-4 py-3 mb-4">
                            ⚠️ Үйлчилгээ нэмэхийн өмнө <strong>Төрлүүд</strong> табаас үндсэн төрлүүдийг нэмнэ үү. (Жишээ: Фото, Видео)
                        </div>
                    )}
                    <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-4 font-medium border-b w-[60px]">Зураг</th>
                                    <th className="px-4 py-4 font-medium border-b">Нэр</th>
                                    <th className="px-4 py-4 font-medium border-b">Үндсэн төрөл</th>
                                    <th className="px-4 py-4 font-medium border-b">Багцууд</th>
                                    <th className="px-4 py-4 font-medium border-b">Ангилал</th>
                                    <th className="px-4 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : services.length === 0 ? (<tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Бүртгэл алга.</td></tr>)
                                        : services.map(s => (
                                            <tr key={s.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    {s.image ? <div className="w-10 h-10 rounded overflow-hidden">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={s.image} alt={s.name} className="w-full h-full object-cover" /></div>
                                                        : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>}
                                                </td>
                                                <td className="px-4 py-3 font-medium">{s.name}</td>
                                                <td className="px-4 py-3">{s.mainType && <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{s.mainType.name}</span>}</td>
                                                <td className="px-4 py-3">
                                                    {s.packages && s.packages.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs text-muted-foreground">{s.packages.length} багцтай</span>
                                                            <span className="font-semibold">{Math.min(...s.packages.map((p: any) => p.price)).toLocaleString()} ₮ -с</span>
                                                        </div>
                                                    ) : <span className="text-muted-foreground text-xs italic">Үнэгүй</span>}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                                    {s.category?.name || "—"}
                                                    <div className={`mt-1 inline-flex px-2 py-0.5 text-[10px] rounded-full ${s.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{s.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => openSvcModal(s)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => deleteSvc(s.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                </Tabs.Content>

                {/* ========= TYPES TAB ========= */}
                <Tabs.Content value="types" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Эдит Төрлүүд</h2>
                        <button onClick={() => openMainModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Үндсэн төрөл нэмэх
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Жишээ: <strong>Фото</strong> (Лого, Зураг янзлах, Хэвлэлийн эх...), <strong>Видео</strong> (Рийл 60 сек, Богино контент 5-10 мин, Нэвтрүүлэг...)</p>
                    {loading ? <p className="text-muted-foreground text-sm">Уншиж байна...</p>
                        : mainTypes.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-border/50 rounded-md text-muted-foreground text-sm">
                                Үндсэн төрөл байхгүй байна.<br />Фото, Видео гэх мэт төрлүүдийг нэмнэ үү.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {mainTypes.map(mt => (
                                    <div key={mt.id} className="rounded-md border border-border/50 bg-card overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                                            <button onClick={() => setExpanded(p => ({ ...p, [mt.id]: !p[mt.id] }))} className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors">
                                                {expanded[mt.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                {mt.name}
                                                <span className="text-xs text-muted-foreground font-normal">({mt.subTypes?.length || 0} дэд төрөл)</span>
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openSubModal(mt.id)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3" /> Дэд төрөл нэмэх</button>
                                                <button onClick={() => openMainModal(mt)} className="text-muted-foreground hover:text-primary ml-2"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => deleteMain(mt.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        {expanded[mt.id] && (
                                            <div className="divide-y divide-border/50">
                                                {mt.subTypes?.length === 0 ? <p className="px-8 py-3 text-sm text-muted-foreground italic">Дэд төрөл байхгүй.</p>
                                                    : mt.subTypes?.map((st: any) => (
                                                        <div key={st.id} className="flex items-center justify-between px-8 py-2.5 text-sm hover:bg-muted/20">
                                                            <div>
                                                                <span className="font-medium">{st.name}</span>
                                                                {st.description && <span className="ml-2 text-muted-foreground text-xs">— {st.description}</span>}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => openSubModal(mt.id, st)} className="text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => deleteSub(st.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                </Tabs.Content>

                {/* ========= CATEGORIES TAB ========= */}
                <Tabs.Content value="categories" className="outline-none pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Ангилал</h2>
                        <button onClick={() => openCatModal()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> Ангилал үүсгэх</button>
                    </div>
                    <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium border-b w-[80px]">ID</th>
                                    <th className="px-6 py-4 font-medium border-b">Нэр</th>
                                    <th className="px-6 py-4 font-medium border-b">Тайлбар</th>
                                    <th className="px-6 py-4 font-medium border-b text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (<tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Уншиж байна...</td></tr>)
                                    : categories.length === 0 ? (<tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Бүртгэл алга.</td></tr>)
                                        : categories.map(c => (
                                            <tr key={c.id} className="hover:bg-muted/30">
                                                <td className="px-6 py-4 text-muted-foreground">{c.id}</td>
                                                <td className="px-6 py-4 font-medium">{c.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{c.description || "—"}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => openCatModal(c)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => deleteCat(c.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                </Tabs.Content>
            </Tabs.Root>

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

            {/* CATEGORY MODAL */}
            {isCatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !savingCat && setIsCatModal(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingCat ? 'Ангилал засах' : 'Ангилал үүсгэх'}</h2>
                            <button onClick={() => !savingCat && setIsCatModal(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="cat-form" onSubmit={saveCat} className="space-y-4">
                                <div className="space-y-1"><label className="text-xs text-gray-400">Нэр <span className="text-red-500">*</span></label>
                                    <input required value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" /></div>
                                <div className="space-y-1"><label className="text-xs text-gray-400">Тайлбар</label>
                                    <textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]" /></div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsCatModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Болих</button>
                            <button type="submit" form="cat-form" disabled={savingCat} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">{savingCat ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN TYPE MODAL */}
            {isMainModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !savingMain && setIsMainModal(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingMain ? 'Үндсэн төрөл засах' : 'Үндсэн төрөл нэмэх'}</h2>
                            <button onClick={() => !savingMain && setIsMainModal(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="main-form" onSubmit={saveMain} className="space-y-4">
                                <div className="space-y-1"><label className="text-xs text-gray-400">Нэр <span className="text-red-500">*</span></label>
                                    <input required placeholder="Фото, Видео..." value={mainForm.name} onChange={e => setMainForm({ ...mainForm, name: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" /></div>
                                <div className="space-y-1"><label className="text-xs text-gray-400">Тайлбар</label>
                                    <textarea value={mainForm.description} onChange={e => setMainForm({ ...mainForm, description: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[60px]" /></div>
                                <div className="space-y-1"><label className="text-xs text-gray-400">Дараалал</label>
                                    <input type="number" value={mainForm.sortOrder} onChange={e => setMainForm({ ...mainForm, sortOrder: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" /></div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsMainModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Болих</button>
                            <button type="submit" form="main-form" disabled={savingMain} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">{savingMain ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB TYPE MODAL */}
            {isSubModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !savingSub && setIsSubModal(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingSub ? 'Дэд төрөл засах' : 'Дэд төрөл нэмэх'}</h2>
                            <button onClick={() => !savingSub && setIsSubModal(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="sub-form" onSubmit={saveSub} className="space-y-4">
                                <div className="space-y-1"><label className="text-xs text-gray-400">Үндсэн төрөл <span className="text-red-500">*</span></label>
                                    <select required value={subForm.mainTypeId} onChange={e => setSubForm({ ...subForm, mainTypeId: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                                        <option value="" disabled className="bg-[#1e1e1e]">Сонгох...</option>
                                        {mainTypes.map(mt => <option key={mt.id} value={mt.id} className="bg-[#1e1e1e]">{mt.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1"><label className="text-xs text-gray-400">Нэр <span className="text-red-500">*</span></label>
                                    <input required placeholder="Лого, Зураг янзлах, Рийл 60 сек..." value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" /></div>
                                <div className="space-y-1"><label className="text-xs text-gray-400">Тайлбар</label>
                                    <textarea value={subForm.description} onChange={e => setSubForm({ ...subForm, description: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[60px]" /></div>
                                <div className="space-y-1"><label className="text-xs text-gray-400">Дараалал</label>
                                    <input type="number" value={subForm.sortOrder} onChange={e => setSubForm({ ...subForm, sortOrder: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" /></div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsSubModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Болих</button>
                            <button type="submit" form="sub-form" disabled={savingSub} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">{savingSub ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SERVICE MODAL */}
            {isSvcModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !savingSvc && setIsSvcModal(false)}></div>
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e1e1e] z-10">
                            <h2 className="text-lg font-semibold tracking-tight">{editingSvc ? 'Үйлчилгээ засах' : 'Шинэ үйлчилгээ нэмэх'}</h2>
                            <button onClick={() => !savingSvc && setIsSvcModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <form id="svc-form" onSubmit={saveSvc} className="space-y-4">
                                {/* Image */}
                                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-lg border border-white/5">
                                    <div className="w-16 h-16 rounded overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {svcForm.image ? <img src={svcForm.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-500" />}
                                    </div>
                                    <button type="button" disabled={uploadingImg} onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm bg-black/20 border border-white/10 hover:bg-white/5 transition-colors rounded-md text-gray-200">
                                        {uploadingImg ? <span className="animate-pulse">Хуулж байна...</span> : "Зураг хуулах"}
                                    </button>
                                </div>

                                {/* Category & Name */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 col-span-2"><label className="text-xs text-gray-400">Ангилал <span className="text-red-500">*</span></label>
                                        <select required value={svcForm.categoryId} onChange={e => setSvcForm({ ...svcForm, categoryId: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                                            <option value="" disabled className="bg-[#1e1e1e]">Сонгох...</option>
                                            {categories.map(c => <option key={c.id} value={c.id} className="bg-[#1e1e1e]">{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1 col-span-2"><label className="text-xs text-gray-400">Нэр <span className="text-red-500">*</span></label>
                                        <input required value={svcForm.name} onChange={e => setSvcForm({ ...svcForm, name: e.target.value })} placeholder="Нэр..." className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                </div>

                                {/* Main + Packages */}
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Үндсэн төрөл <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            value={svcForm.mainTypeId}
                                            onChange={e => setSvcForm({ ...svcForm, mainTypeId: e.target.value, packages: [{ id: Date.now().toString(), subTypeId: "", price: "", priceLabel: "" }] })}
                                            className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                                        >
                                            <option value="" disabled className="bg-[#1e1e1e]">— Үндсэн төрөл сонгох —</option>
                                            {mainTypes.map(mt => <option key={mt.id} value={mt.id} className="bg-[#1e1e1e]">{mt.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs text-gray-400">Үнийн багцууд <span className="text-red-500">*</span></label>
                                            <button type="button" onClick={addPackage} className="text-[10px] flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition-colors disabled:opacity-50">
                                                <Plus className="w-3 h-3" /> нэмэх
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {svcForm.packages.map((pkg, idx) => (
                                                <div key={pkg.id || idx} className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1 block">Контентийн төрөл</label>
                                                        <select
                                                            required
                                                            value={pkg.subTypeId}
                                                            onChange={e => updatePackage(idx, 'subTypeId', e.target.value)}
                                                            className="w-full bg-white/5 border border-white/5 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary appearance-none"
                                                        >
                                                            <option value="" disabled className="bg-[#1e1e1e]">Сонгох...</option>
                                                            {filteredSubTypes.map((st: any) => <option key={st.id} value={st.id} className="bg-[#1e1e1e]">{st.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1 block">Нэршил (Сонголттой)</label>
                                                        <input
                                                            type="text"
                                                            value={pkg.priceLabel || ""}
                                                            onChange={e => updatePackage(idx, 'priceLabel', e.target.value)}
                                                            placeholder="Жишээ: Бичлэг + Эвлүүлэг..."
                                                            className="w-full bg-white/5 border border-white/5 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1 block">Үнэ (₮)</label>
                                                        <input
                                                            type="number" min={0}
                                                            value={pkg.price}
                                                            onChange={e => updatePackage(idx, 'price', e.target.value)}
                                                            className="w-full bg-white/5 border border-white/5 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                                                            required
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removePackage(idx)}
                                                        disabled={svcForm.packages.length <= 1}
                                                        className="mt-4 text-gray-500 hover:text-red-500 disabled:opacity-30 flex justify-center"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {svcForm.mainTypeId && filteredSubTypes.length === 0 && (
                                                <p className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded p-2 mt-2">⚠️ Энэ үндсэн төрөлд дэд төрөл байхгүй байна. Эхлээд дэд төрөл нэмнэ үү.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-1"><label className="text-xs text-gray-400">Тайлбар</label>
                                    <textarea value={svcForm.description} onChange={e => setSvcForm({ ...svcForm, description: e.target.value })} placeholder="Тайлбар..." className="w-full bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]" />
                                </div>

                                {/* Amenities */}
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 block">Давуу талууд</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Шинэ давуу тал..."
                                            className="flex-1 bg-black/20 border border-white/5 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                            id="new-amenity-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addAmenity(e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('new-amenity-input') as HTMLInputElement;
                                                if (input) { addAmenity(input.value); input.value = ''; }
                                            }}
                                            className="px-3 py-2 bg-white/10 text-gray-200 rounded-md text-sm hover:bg-white/20 transition-colors border border-white/5 shrink-0"
                                        >
                                            Нэмэх
                                        </button>
                                    </div>
                                    {svcForm.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-3 bg-black/10 border border-white/5 rounded-md">
                                            {svcForm.amenities.map((amenity, idx) => (
                                                <div key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-black/20 border border-white/10 text-gray-200 rounded-full">
                                                    <span>{amenity}</span>
                                                    <button type="button" onClick={() => removeAmenity(idx)} className="text-gray-500 hover:text-red-500 transition-colors p-0.5"><X className="w-3 h-3" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={svcForm.isActive} onChange={e => setSvcForm({ ...svcForm, isActive: e.target.checked })} className="accent-primary" /> Идэвхтэй</label>
                            </form>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3 mt-auto bg-black/20">
                            <button type="button" onClick={() => setIsSvcModal(false)} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Болих</button>
                            <button type="submit" form="svc-form" disabled={savingSvc} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">{savingSvc ? <span className="animate-pulse">Түр хүлээнэ...</span> : 'Хадгалах'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
