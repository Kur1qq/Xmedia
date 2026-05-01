"use client";

import { useEffect, useState } from "react";
import { Users, CalendarDays, Camera, CreditCard, FileText, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Mic2, MonitorPlay, Scissors, Blocks, Camera as CameraIcon, Filter, Calendar as CalendarIcon, Clock, Download } from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns";
import * as xlsx from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeStudios: 0,
    activeEquipment: 0,
    pendingInvoiceUsers: 0,
    revenueChart: [] as { label: string, amount: number }[],
    weeklyRevenueChart: [] as { label: string, amount: number }[],
    breakdown: {
      studioRevenue: 0,
      liveRevenue: 0,
      editRevenue: 0,
      bundleRevenue: 0,
      photographerRevenue: 0
    }
  });
  const [loading, setLoading] = useState(true);

  // Custom filter states
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [serviceType, setServiceType] = useState("ALL");
  const [customRevenue, setCustomRevenue] = useState<number | null>(null);
  const [customRevenueDetails, setCustomRevenueDetails] = useState<any[]>([]);
  const [searchedDates, setSearchedDates] = useState({ start: "", end: "" });
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const handleCustomSearch = async () => {
    setSearchLoading(true);
    try {
      const queryParams = new URLSearchParams();
      const startStr = startDate ? format(startDate, "yyyy-MM-dd") : "";
      const endStr = endDate ? format(endDate, "yyyy-MM-dd") : "";

      if (startStr) queryParams.append("startDate", startStr);
      if (endStr) queryParams.append("endDate", endStr);
      if (serviceType) queryParams.append("serviceType", serviceType);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/dashboard/custom-revenue?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomRevenue(data.customRevenue);
        setCustomRevenueDetails(data.details || []);
        setSearchedDates({ start: startStr, end: endStr });
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to fetch custom revenue", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const getServiceLabel = (type: string) =>
    type === "STUDIO" ? "Студио" :
    type === "LIVE_SERVICE" ? "Шууд дамжуулалт" :
    type === "EDIT_SERVICE" ? "Эдит" :
    type === "BUNDLE_SERVICE" ? "Багц үйлчилгээ" :
    type === "PHOTOGRAPHER_SERVICE" || type === "SERVICE" ? "Зурагчин, Зураглаач" : type;

  const getServiceColor = (type: string) =>
    type === "STUDIO" ? "text-orange-400 bg-orange-500/10" :
    type === "LIVE_SERVICE" ? "text-red-400 bg-red-500/10" :
    type === "EDIT_SERVICE" ? "text-purple-400 bg-purple-500/10" :
    type === "BUNDLE_SERVICE" ? "text-indigo-400 bg-indigo-500/10" :
    "text-blue-400 bg-blue-500/10";

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const sortedDetails = [...customRevenueDetails].sort((a, b) => {
    let av: any, bv: any;
    if (sortKey === "date") { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
    else if (sortKey === "bookingDate") { av = a.bookingDate ? new Date(a.bookingDate).getTime() : 0; bv = b.bookingDate ? new Date(b.bookingDate).getTime() : 0; }
    else if (sortKey === "totalPrice") { av = Number(a.totalPrice); bv = Number(b.totalPrice); }
    else if (sortKey === "userName") { av = a.userName || ""; bv = b.userName || ""; }
    else if (sortKey === "serviceType") { av = getServiceLabel(a.serviceType); bv = getServiceLabel(b.serviceType); }
    else { av = a[sortKey]; bv = b[sortKey]; }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedDetails.length / PAGE_SIZE);
  const pagedDetails = sortedDetails.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronsUpDown size={13} className="ml-1 inline text-muted-foreground/50" />;
    return sortDir === "asc" ? <ChevronUp size={13} className="ml-1 inline text-primary" /> : <ChevronDown size={13} className="ml-1 inline text-primary" />;
  };

  const downloadExcel = () => {
    if (!customRevenueDetails || customRevenueDetails.length === 0) return;

    const excelData = sortedDetails.map((item, index) => ({
      "№": index + 1,
      "Хэрэглэгч": item.userName,
      "Утас": item.userPhone,
      "Үйлчилгээ": getServiceLabel(item.serviceType),
      "Төлсөн дүн (₮)": Number(item.totalPrice).toLocaleString(),
      "Үйлчилгээний огноо": item.bookingDate ? format(new Date(item.bookingDate), "yyyy-MM-dd") : "-",
      "Төлбөр хийсэн огноо": format(new Date(item.date), "yyyy-MM-dd HH:mm")
    }));

    const totalAmount = customRevenueDetails.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    excelData.push({
      "№": "" as any,
      "Хэрэглэгч": "НИЙТ ОРЛОГО:",
      "Утас": "",
      "Үйлчилгээ": "",
      "Төлсөн дүн (₮)": totalAmount.toLocaleString(),
      "Үйлчилгээний огноо": "",
      "Төлбөр хийсэн огноо": ""
    } as any);

    const startStr = searchedDates.start || "Бүх хугацаа";
    const endStr = searchedDates.end || "Бүх хугацаа";
    const dateRangeLabel = startStr === endStr ? `Хугацаа: ${startStr}` : `Хугацаа: ${startStr} -аас ${endStr} хүртэлх`;
    const serviceLabel = serviceType === "ALL" ? "Бүх үйлчилгээ" : getServiceLabel(serviceType);

    const worksheet = xlsx.utils.aoa_to_sheet([
      ["ОРЛОГЫН ДЭЛГЭРЭНГҮЙ ТАЙЛАН"],
      [dateRangeLabel],
      [`Үйлчилгээ: ${serviceLabel}`],
      [""]
    ]);

    xlsx.utils.sheet_add_json(worksheet, excelData, { origin: "A5", skipHeader: false });

    // Set column widths
    worksheet["!cols"] = [
      { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 22 }
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Орлогын тайлан");
    xlsx.writeFile(workbook, `Орлого_Тайлан_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/dashboard/summary`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const cards = [
    {
      title: "Нийт хэрэглэгч",
      value: loading ? "..." : stats.totalUsers.toString(),
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Нийт захиалга",
      value: loading ? "..." : stats.totalBookings.toString(),
      icon: CalendarDays,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Орлого",
      value: loading ? "..." : `${Number(stats.totalRevenue).toLocaleString()} ₮`,
      icon: CreditCard,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      title: "Төхөөрөмж / Студи",
      value: loading ? "..." : `${stats.activeEquipment} / ${stats.activeStudios}`,
      icon: Camera,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Нэхэмжлэл хүлээж буй захиалгууд",
      value: loading ? "..." : stats.pendingInvoiceUsers.toString(),
      icon: FileText,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ];



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Хяналтын самбар</h1>
          <p className="text-muted-foreground mt-1">Системийн ерөнхий мэдээлэл болон статистик.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat, i) => (
          <div key={i} className="bg-card hover:bg-muted/50 transition-colors cursor-default border-border p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mt-6">
        <div className="bg-card hover:bg-muted/50 transition-colors cursor-default border-border p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground line-clamp-1">Студио</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
              <Mic2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-xl font-bold">{loading ? "..." : `${Number(stats.breakdown?.studioRevenue || 0).toLocaleString()} ₮`}</span>
          </div>
        </div>

        <div className="bg-card hover:bg-muted/50 transition-colors cursor-default border-border p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground line-clamp-1">Шууд дамжуулалт</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <MonitorPlay size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-xl font-bold">{loading ? "..." : `${Number(stats.breakdown?.liveRevenue || 0).toLocaleString()} ₮`}</span>
          </div>
        </div>

        <div className="bg-card hover:bg-muted/50 transition-colors cursor-default border-border p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground line-clamp-1">Эдит</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Scissors size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-xl font-bold">{loading ? "..." : `${Number(stats.breakdown?.editRevenue || 0).toLocaleString()} ₮`}</span>
          </div>
        </div>

        <div className="bg-card hover:bg-muted/50 transition-colors cursor-default border-border p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground line-clamp-1">Багц үйлчилгээ</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Blocks size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-xl font-bold">{loading ? "..." : `${Number(stats.breakdown?.bundleRevenue || 0).toLocaleString()} ₮`}</span>
          </div>
        </div>

        <div className="bg-card hover:bg-muted/50 transition-colors cursor-default border-border p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground line-clamp-1">Зурагчин, Зураглаач</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <CameraIcon size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-xl font-bold">{loading ? "..." : `${Number(stats.breakdown?.photographerRevenue || 0).toLocaleString()} ₮`}</span>
          </div>
        </div>
      </div>

      {/* Custom Filter Section - Simplified Inline UI */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 mt-6 bg-card p-3 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-muted-foreground hidden sm:block" />
          <select 
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="h-9 w-full sm:w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">Бүх үйлчилгээ</option>
            <option value="STUDIO">Студио</option>
            <option value="LIVE_SERVICE">Шууд дамжуулалт</option>
            <option value="EDIT_SERVICE">Эдит</option>
            <option value="BUNDLE_SERVICE">Багц үйлчилгээ</option>
            <option value="PHOTOGRAPHER_SERVICE">Зурагчин, Зураглаач</option>
          </select>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full sm:w-[140px] justify-start text-left font-normal h-9", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {startDate ? format(startDate, "yyyy-MM-dd") : <span>Эхлэх огноо</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar initialFocus mode="single" defaultMonth={startDate} selected={startDate} onSelect={setStartDate} />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground hidden sm:inline">-</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full sm:w-[140px] justify-start text-left font-normal h-9", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {endDate ? format(endDate, "yyyy-MM-dd") : <span>Дуусах огноо</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar initialFocus mode="single" defaultMonth={endDate} selected={endDate} onSelect={setEndDate} />
            </PopoverContent>
          </Popover>
        </div>

        <button 
          onClick={handleCustomSearch}
          disabled={searchLoading}
          className="h-9 px-4 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors disabled:opacity-50 text-sm w-full sm:w-auto"
        >
          {searchLoading ? "Уншиж байна..." : "Шүүж харах"}
        </button>

        {customRevenue !== null && (
          <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
            <div className="text-center sm:text-right px-4 py-1.5 rounded-md bg-primary/20 text-primary font-bold text-sm shadow-sm flex-1 sm:flex-none">
              Үр дүн: {Number(customRevenue).toLocaleString()} ₮
            </div>
            {customRevenueDetails.length > 0 && (
              <Button onClick={downloadExcel} variant="outline" className="h-9 w-full sm:w-auto text-sm border-primary/30 hover:bg-primary/10 transition-colors">
                <Download className="mr-2 h-4 w-4" />
                Excel татах
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Detailed Transaction Table */}
      {customRevenue !== null && (
        <div className="mt-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-semibold">Төлбөрийн дэлгэрэнгүй мэдээлэл</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {customRevenueDetails.length} гүйлгээ · нийт {Number(customRevenue).toLocaleString()} ₮
              </p>
            </div>
          </div>

          {customRevenueDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CreditCard size={36} className="mb-3 opacity-30" />
              <p className="text-sm">Энэ хугацаанд төлбөр байхгүй байна</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-muted-foreground text-xs">
                      <th className="px-4 py-3 text-left font-medium w-10">#</th>
                      <th
                        className="px-4 py-3 text-left font-medium cursor-pointer hover:text-foreground select-none"
                        onClick={() => handleSort("userName")}
                      >
                        Хэрэглэгч <SortIcon col="userName" />
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Утас</th>
                      <th
                        className="px-4 py-3 text-left font-medium cursor-pointer hover:text-foreground select-none"
                        onClick={() => handleSort("serviceType")}
                      >
                        Үйлчилгээ <SortIcon col="serviceType" />
                      </th>
                      <th
                        className="px-4 py-3 text-right font-medium cursor-pointer hover:text-foreground select-none"
                        onClick={() => handleSort("totalPrice")}
                      >
                        Дүн <SortIcon col="totalPrice" />
                      </th>
                      <th
                        className="px-4 py-3 text-left font-medium cursor-pointer hover:text-foreground select-none"
                        onClick={() => handleSort("bookingDate")}
                      >
                        Үйлчилгээний огноо <SortIcon col="bookingDate" />
                      </th>
                      <th
                        className="px-4 py-3 text-left font-medium cursor-pointer hover:text-foreground select-none"
                        onClick={() => handleSort("date")}
                      >
                        Төлбөр хийсэн <SortIcon col="date" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pagedDetails.map((item, i) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {(currentPage - 1) * PAGE_SIZE + i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{item.userName}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.userPhone}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceColor(item.serviceType)}`}>
                            {getServiceLabel(item.serviceType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-primary">
                            {Number(item.totalPrice).toLocaleString()} ₮
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {item.bookingDate ? format(new Date(item.bookingDate), "yyyy-MM-dd") : <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {format(new Date(item.date), "yyyy-MM-dd HH:mm")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/20 border-t border-border">
                      <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-muted-foreground">НИЙТ ДҮН</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-primary text-sm">
                          {Number(customRevenue).toLocaleString()} ₮
                        </span>
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sortedDetails.length)} / {sortedDetails.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                    >‹</button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page = i + 1;
                      if (totalPages > 7) {
                        if (currentPage <= 4) page = i + 1;
                        else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                        else page = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`h-7 w-7 flex items-center justify-center rounded-md border text-xs transition-colors ${
                            page === currentPage
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-muted"
                          }`}
                        >{page}</button>
                      );
                    })}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                    >›</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* Monthly Chart */}
        <div className="bg-background border-border p-6 rounded-xl border shadow-sm min-h-[300px] flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-accent-foreground">Орлогын мэдээлэл (Сүүлийн 6 сар)</h2>
          <div className="flex-1 min-h-[250px] w-full mt-2">
            {!loading && stats.revenueChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} dx={-10} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k ₮` : `${value} ₮`} width={60} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`${Number(value || 0).toLocaleString()} ₮`, 'Орлого']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">Уншиж байна...</div>
            )}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-background border-border p-6 rounded-xl border shadow-sm min-h-[300px] flex flex-col">
          <h2 className="text-lg font-semibold text-accent-foreground mb-4">Сүүлийн 8 долоо хоногийн орлого</h2>
          <div className="flex-1 min-h-[250px] w-full">
            {!loading && stats.weeklyRevenueChart && stats.weeklyRevenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyRevenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} dx={-10} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`} width={50} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`${Number(value || 0).toLocaleString()} ₮`, 'Орлого']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue2)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">
                {loading ? "Уншиж байна..." : "Мэдээлэл байхгүй"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
