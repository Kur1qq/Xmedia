import { Users, DollarSign, Activity, FileText } from "lucide-react";

export default function Home() {
  const stats = [
    { label: "Total Users", value: "2,543", icon: Users, change: "+12.5%", positive: true },
    { label: "Revenue", value: "$45,231.89", icon: DollarSign, change: "+5.2%", positive: true },
    { label: "Active Sessions", value: "1,204", icon: Activity, change: "-2.4%", positive: false },
    { label: "Total Articles", value: "854", icon: FileText, change: "+18.1%", positive: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here is what&apos;s happening today.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-background border-border p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <stat.icon size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className={`text-xs font-medium ${stat.positive ? "text-emerald-500" : "text-rose-500"}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mock Chart Area */}
        <div className="bg-background border-border p-6 rounded-xl border shadow-sm min-h-[300px] flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-accent-foreground">Revenue Analytics</h2>
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
          <h2 className="text-lg font-semibold mb-6 text-accent-foreground">Recent Activity</h2>
          <div className="space-y-6">
            {[
              { title: "New user registered", time: "2 minutes ago", initial: "U", bg: "bg-blue-500/10 text-blue-500" },
              { title: "System updated", time: "1 hour ago", initial: "S", bg: "bg-purple-500/10 text-purple-500" },
              { title: "Payment processed", time: "3 hours ago", initial: "P", bg: "bg-emerald-500/10 text-emerald-500" },
              { title: "Server error logged", time: "5 hours ago", initial: "E", bg: "bg-rose-500/10 text-rose-500" }
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
