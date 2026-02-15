import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, Activity, ArrowUpRight, Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
    // Mock Data for Dashboard
    const stats = [
        {
            title: "Нийт орлого",
            value: "₮45,231,890",
            percentage: "+20.1%",
            icon: DollarSign,
            desc: "Өнгөрсөн сараас",
            color: "text-green-500"
        },
        {
            title: "Шинэ захиалгууд",
            value: "+150",
            percentage: "+180.1%",
            icon: Calendar,
            desc: "Өнгөрсөн сараас",
            color: "text-blue-500"
        },
        {
            title: "Шинэ хэрэглэгч",
            value: "+12,234",
            percentage: "+19%",
            icon: Users,
            desc: "Өнгөрсөн сараас",
            color: "text-orange-500"
        },
        {
            title: "Идэвхтэй студи",
            value: "3/4",
            percentage: "+2",
            icon: Activity,
            desc: "Яг одоо ашиглагдаж байна",
            color: "text-red-500"
        }
    ];

    const recentBookings = [
        {
            id: "INV001",
            user: "Б. Болд",
            email: "bold@example.com",
            studio: "Гэрэл зургийн студи",
            date: "2024-02-16",
            time: "14:00 - 16:00",
            amount: "₮300,000",
            status: "Confirmed",
            avatar: "B"
        },
        {
            id: "INV002",
            user: "С. Саран",
            email: "saran@example.com",
            studio: "Подкаст өрөө",
            date: "2024-02-16",
            time: "10:00 - 11:00",
            amount: "₮50,000",
            status: "Pending",
            avatar: "S"
        },
        {
            id: "INV003",
            user: "Д. Дорж",
            email: "dorj@example.com",
            studio: "Видео студи",
            date: "2024-02-17",
            time: "09:00 - 18:00",
            amount: "₮1,200,000",
            status: "Confirmed",
            avatar: "D"
        },
        {
            id: "INV004",
            user: "Г. Ган",
            email: "gan@example.com",
            studio: "Гэрэл зургийн студи",
            date: "2024-02-15",
            time: "13:00 - 15:00",
            amount: "₮300,000",
            status: "Cancelled",
            avatar: "G"
        },
        {
            id: "INV005",
            user: "Э. Энх",
            email: "enkh@example.com",
            studio: "Контент өрөө",
            date: "2024-02-18",
            time: "11:00 - 12:00",
            amount: "₮80,000",
            status: "Pending",
            avatar: "E"
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Confirmed": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "Pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-gray-500/10 text-gray-500";
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Хяналтын самбар</h2>
                    <p className="text-muted-foreground mt-1">
                        Өнөөдөр: {new Date().toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 bg-black/40">
                        <Calendar className="mr-2 h-4 w-4" />
                        Хугацаа сонгох
                    </Button>
                    <Button className="bg-primary hover:bg-red-600 text-white shadow-lg shadow-red-900/20">
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Тайлан татах
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((item, index) => (
                    <Card key={index} className="bg-[#111] border-white/10 hover:border-primary/50 transition-all duration-300 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                                {item.title}
                            </CardTitle>
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{item.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className={item.percentage.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                                    {item.percentage}
                                </span>{" "}
                                {item.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
                <Card className="col-span-4 bg-[#111] border-white/10">
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle className="text-white">Сүүлийн захиалгууд</CardTitle>
                            <CardDescription className="text-gray-400">
                                Энэ сард нийт 204 захиалга хийгдсэн байна.
                            </CardDescription>
                        </div>
                        <Button asChild size="sm" variant="ghost" className="ml-auto gap-1 text-primary hover:text-primary hover:bg-primary/10">
                            <Link href="/dashboard/bookings">
                                Бүгдийг харах
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentBookings.map((booking, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9 border border-white/10">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.user}`} alt="Avatar" />
                                            <AvatarFallback className="bg-zinc-800 text-white">{booking.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-1">
                                            <p className="text-sm font-medium leading-none text-white">
                                                {booking.user}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-sm text-gray-400 w-32 truncate">
                                        {booking.studio}
                                    </div>
                                    <div className="hidden md:flex flex-col items-end gap-1 w-32">
                                        <div className="text-sm font-medium text-white">{booking.date}</div>
                                        <div className="text-xs text-gray-500">{booking.time}</div>
                                    </div>
                                    <div className="flex items-center gap-4 w-32 justify-end">
                                        <Badge variant="outline" className={getStatusColor(booking.status)}>
                                            {booking.status === "Confirmed" && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {booking.status === "Pending" && <AlertCircle className="w-3 h-3 mr-1" />}
                                            {booking.status === "Cancelled" && <XCircle className="w-3 h-3 mr-1" />}
                                            {booking.status}
                                        </Badge>
                                    </div>
                                    <div className="font-medium text-white w-24 text-right">
                                        {booking.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-[#111] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Удахгүй болох хуваарь</CardTitle>
                        <CardDescription className="text-gray-400">
                            Өнөөдрийн студи ашиглалтын хуваарь
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { time: "09:00", title: "Гэрэл зургийн студи", user: "Bat-Erdene", status: "In Progress" },
                                { time: "11:00", title: "Подкаст өрөө", user: "Tech Talk Show", status: "Upcoming" },
                                { time: "13:00", title: "Видео студи", user: "Music Video Shoot", status: "Upcoming" },
                                { time: "15:00", title: "Гэрэл зургийн студи", user: "Fashion Shoot", status: "Upcoming" },
                                { time: "16:30", title: "Контент өрөө", user: "Live Stream", status: "Upcoming" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                    <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                                        <span className="text-sm font-bold text-white">{item.time}</span>
                                        <div className={`h-full w-0.5 mt-2 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-white/10'}`} />
                                    </div>
                                    <div className="grid gap-1 pb-2">
                                        <p className="text-sm font-medium leading-none text-white">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.user}
                                        </p>
                                    </div>
                                    <div className="ml-auto">
                                        {i === 0 ? (
                                            <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0">
                                                Active
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-gray-500">Upcoming</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
