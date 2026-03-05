"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function CancelContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("bookingId");

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white">Төлбөр цуцлагдсан</h1>
                <p className="text-gray-400">
                    Таны төлбөр цуцлагдлаа. Та дахин захиалга өгөх боломжтой.
                </p>
                <div className="pt-4 flex flex-col gap-3">
                    <Link href="/">
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                            Нүүр хуудас руу буцах
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function BookingCancelPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><p className="text-white">Уншиж байна...</p></div>}>
            <CancelContent />
        </Suspense>
    );
}
