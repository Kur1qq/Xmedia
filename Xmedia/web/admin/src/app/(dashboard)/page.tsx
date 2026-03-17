"use client";

import { useEffect, useState } from "react";
import { Users, CalendarDays, Camera, CreditCard, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeStudios: 0,
    activeEquipment: 0,
    pendingInvoiceUsers: 0,
    revenueChart: [] as { label: string, amount: number }[],
    weeklyRevenueChart: [] as { label: string, amount: number }[]
  });
  const [loading, setLoading] = useState(true);

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

      <div className="grid gap-6 lg:grid-cols-2">
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
