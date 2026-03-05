"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, FileText, X } from "lucide-react";

interface PaymentMethodModalProps {
    open: boolean;
    onClose: () => void;
    onSelectQpay: () => void;
    onSelectInvoice: () => void;
    loading?: boolean;
    amount?: number;
}

export function PaymentMethodModal({
    open,
    onClose,
    onSelectQpay,
    onSelectInvoice,
    loading,
    amount,
}: PaymentMethodModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 60, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-[#111] w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
                            <div>
                                <h2 className="text-white font-bold text-lg">Төлбөрийн хэлбэр</h2>
                                {amount !== undefined && (
                                    <p className="text-gray-400 text-sm mt-0.5">Нийт: <span className="text-primary font-bold">₮{amount.toLocaleString()}</span></p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Options */}
                        <div className="p-4 space-y-3">
                            {/* QPay */}
                            <button
                                disabled={loading}
                                onClick={onSelectQpay}
                                className="w-full group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-11 h-11 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-white font-semibold text-sm">QPay / Онлайн төлбөр</p>
                                    <p className="text-gray-400 text-xs mt-0.5">Byl.mn — банкны аппаар төлөх</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                            </button>

                            {/* Invoice */}
                            <button
                                disabled={loading}
                                onClick={onSelectInvoice}
                                className="w-full group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-11 h-11 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <FileText className="w-5 h-5 text-gray-300" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-white font-semibold text-sm">Нэхэмжлэл</p>
                                    <p className="text-gray-400 text-xs mt-0.5">Захиалга бүртгэж, нэхэмжлэл авах</p>
                                </div>
                            </button>
                        </div>

                        <div className="pb-6 px-4">
                            <p className="text-center text-xs text-gray-600">Та цуцлах бол дээрх × дарна уу</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
