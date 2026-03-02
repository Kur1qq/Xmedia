import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen overflow-hidden flex flex-col">
            <Header />
            <main className="flex-1 overflow-hidden">{children}</main>
            <Footer />
        </div>
    );
}
