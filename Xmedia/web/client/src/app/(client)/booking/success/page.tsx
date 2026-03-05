"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function SuccessContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("bookingId");
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if (!bookingId) {
            setVerifying(false);
            return;
        }

        // Call backend to verify and confirm payment via Byl.mn API
        fetch(`${API}/bookings/${bookingId}/verify-payment`, { method: "POST" })
            .then((res) => res.json())
            .then((data) => {
                setVerified(data.success === true);
            })
            .catch(() => {
                setVerified(false);
            })
            .finally(() => {
                setVerifying(false);
            });
    }, [bookingId]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    {verifying ? (
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-white">
                    {verifying ? "Төлбөр шалгаж байна..." : "Захиалга амжилттай!"}
                </h1>
                <p className="text-gray-400">
                    {verifying
                        ? "Түр хүлээнэ үү, төлбөрийн мэдээллийг баталгаажуулж байна."
                        : "Таны төлбөр амжилттай төлөгдлөө. Бид тантай удахгүй холбогдох болно."}
                </p>
                {bookingId && (
                    <p className="text-sm text-gray-500">Захиалгын дугаар: #{bookingId}</p>
                )}
                {!verifying && (
                    <div className="pt-4">
                        <Link href="/">
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-8">
                                Нүүр хуудас руу буцах
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><p className="text-white">Уншиж байна...</p></div>}>
            <SuccessContent />
        </Suspense>
    );
}
