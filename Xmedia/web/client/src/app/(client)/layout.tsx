import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClientLoader } from "@/components/layout/ClientLoader";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <ClientLoader />
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
        </div>
    );
}
