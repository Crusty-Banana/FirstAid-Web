"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function LoadingModal({ text }: { text: string }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    if (!isMounted) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 text-white backdrop-blur-sm">
            <p className="text-lg font-semibold">{text}</p>
        </div>,
        document.body
    );
}