"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    router.replace("/c/new");
  }, [router]);

  return (
    <main
      data-lk-theme="default"
      className="h-full grid content-center bg-gray-900"
    >
        <p>{t("loading")}</p>
    </main>
  );
}