"use client";

import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        preferences: { isVietnamese: true },
      });
      router.push("/auth/login");
    } catch (err) {
      setError(t("failed_to_register"));
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-white text-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-100 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <div className="flex">
            <Image src="/firstAidLogo.png" alt="FirstAid Logo" width={140} height={140} />
            <Image src="/logo2.webp" alt="Logo 2" width={180} height={60} className="p-3"/>
          </div>
          <h1 className="text-2xl font-bold text-center mt-4">{t("create_account")}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
                <input placeholder={t("first_name")} value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-3 py-2 mt-1 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                <input placeholder={t("last_name")} value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-3 py-2 mt-1 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <input placeholder={t("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder={t("password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full py-2 font-semibold text-white bg-primary rounded-md hover:bg-primary/90">
            {t("register")}
          </button>
        </form>
        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our{" "}
          <Link
            href="https://sites.google.com/view/first-aid-pp/home"
            className="text-blue-500"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="https://sites.google.com/view/first-aid-terms-of-service/home"
            className="text-blue-500"
          >
            Terms of Service
          </Link>
          .
        </p>
        <p className="text-sm text-center text-gray-600">
          {t("already_have_account")}{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}