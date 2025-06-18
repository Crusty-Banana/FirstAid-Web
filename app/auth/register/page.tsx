"use client";

import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

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
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold text-center">{t("create_account")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
                <input placeholder={t("first_name")} value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder={t("last_name")} value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
             <input placeholder={t("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
             <input placeholder={t("password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            {t("register")}
          </button>
        </form>
         <p className="text-sm text-center text-gray-400">
          {t("already_have_account")}{" "}
          <Link href="/auth/login" className="font-medium text-blue-400 hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}