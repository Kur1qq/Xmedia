"use client";

import { useEffect, useState } from "react";
import { Users, CalendarDays, Camera, CreditCard, FileText } from "lucide-react";
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
      }
    } catch (error) {
      console.error("Failed to fetch custom revenue", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!customRevenueDetails || customRevenueDetails.length === 0) return;

    const excelData = customRevenueDetails.map((item, index) => ({
      "№": index + 1,
      "Үйлчилгээ": item.serviceType === "STUDIO" ? "Студио" :
                   item.serviceType === "LIVE_SERVICE" ? "Шууд дамжуулалт" :
                   item.serviceType === "EDIT_SERVICE" ? "Эдит" :
                   item.serviceType === "BUNDLE_SERVICE" ? "Багц үйлчилгээ" :
                   item.serviceType === "PHOTOGRAPHER_SERVICE" ? "Зурагчин, Зураглаач" : 
                   item.serviceType === "SERVICE" ? "Зурагчин, Зураглаач" : item.serviceType,
      "Төлсөн дүн": `${Number(item.totalPrice).toLocaleString()}`,
      "Хэрэглэгч": item.userName,
      "Утас": item.userPhone,
      "Огноо": format(new Date(item.date), "yyyy-MM-dd HH:mm")
    }));

    const totalAmount = customRevenueDetails.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    excelData.push({
      "№": "НИЙТ ОРЛОГО:",
      "Үйлчилгээ": "",
      "Төлсөн дүн": `${totalAmount.toLocaleString()}`,
      "Хэрэглэгч": "",
      "Утас": "",
      "Огноо": ""
    } as any);

    const startStr = searchedDates.start || "Бүх хугацаа";
    const endStr = searchedDates.end || "Бүх хугацаа";
    const dateRangeLabel = startStr === endStr ? `Хугацаа: ${startStr}` : `Хугацаа: ${startStr} -аас ${endStr} хүртэлх`;

    const worksheet = xlsx.utils.aoa_to_sheet([
      ["ОРЛОГЫН ТАЙЛАН"],
      [dateRangeLabel],
      [""]
    ]);
    
    xlsx.utils.sheet_add_json(worksheet, excelData, { origin: "A4", skipHeader: false });

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
