"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/c/new");
  }, [router]);

  return (
    <main
      data-lk-theme="default"
      className="h-full grid content-center bg-gray-900"
    >
        <p>Loading...</p>
    </main>
  );
}