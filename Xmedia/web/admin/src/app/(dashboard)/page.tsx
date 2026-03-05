"use client";

import { useEffect, useState } from "react";
import { Users, CalendarDays, Camera, CreditCard } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeStudios: 0,
    activeEquipment: 0
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
        {/* Mock Chart Area */}
        <div className="bg-background border-border p-6 rounded-xl border shadow-sm min-h-[300px] flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-accent-foreground">Орлогын мэдээлэл</h2>
          <div className="flex-1 rounded-lg border border-dashed border-border border-b-0 flex items-end px-4 gap-2 pt-8 relative">
            <div className="absolute inset-x-0 bottom-0 top-0 grid grid-rows-4 opacity-5 pointer-events-none">
              <div className="border-b border-foreground w-full"></div>
              <div className="border-b border-foreground w-full"></div>
              <div className="border-b border-foreground w-full"></div>
              <div className="border-b border-foreground w-full"></div>
            </div>
            {/* Fake Bars */}
            <div className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[40%]"></div>
            <div className="w-full bg-primary/40 hover:bg-primary transition-colors rounded-t-sm h-[60%]"></div>
            <div className="w-full bg-primary/30 hover:bg-primary transition-colors rounded-t-sm h-[50%]"></div>
            <div className="w-full bg-primary/70 hover:bg-primary transition-colors rounded-t-sm h-[80%]"></div>
            <div className="w-full bg-primary/50 hover:bg-primary transition-colors rounded-t-sm h-[65%]"></div>
            <div className="w-full bg-primary/90 hover:bg-primary transition-colors rounded-t-sm h-[95%]"></div>
            <div className="w-full bg-primary/100 hover:bg-primary transition-colors rounded-t-sm h-[100%]"></div>
          </div>
        </div>

        {/* Mock Recent Activity Area */}
        <div className="bg-background border-border p-6 rounded-xl border shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold mb-6 text-accent-foreground">Сүүлийн үйл ажиллагаа</h2>
          <div className="space-y-6">
            {[
              { title: "Шинэ хэрэглэгч бүртгүүллээ", time: "2 минутын өмнө", initial: "Ш", bg: "bg-blue-500/10 text-blue-500" },
              { title: "Төхөөрөмж нэмэгдсэн", time: "1 цагийн өмнө", initial: "Т", bg: "bg-purple-500/10 text-purple-500" },
              { title: "Захиалга баталгаажсан", time: "3 цагийн өмнө", initial: "З", bg: "bg-emerald-500/10 text-emerald-500" },
              { title: "Захиалга цуцлагдсан", time: "5 цагийн өмнө", initial: "З", bg: "bg-rose-500/10 text-rose-500" }
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs flex-shrink-0 ${activity.bg}`}>
                  {activity.initial}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
