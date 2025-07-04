"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { t } = useTranslation();

  // 1. Core logic is moved to its own function
  const handleLogin = async () => {
    setError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, refresh_token } = response.data;
      await login(access_token, refresh_token);
      console.log(`[auth/login]: login-ed. access_token: ${access_token}`);
    } catch (err) {
      setError(t("failed_to_login"));
      console.error(err);
    }
  };

  // 2. The form's submit handler calls the new login function
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  // 3. The keydown handler also calls the new login function
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-white text-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-100 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <div className="flex">
            <Image src="/firstAidLogo.png" alt="FirstAid Logo" width={140} height={140} />
            <Image src="/logo2.webp" alt="Logo 2" width={180} height={60} className="p-3"/>
          </div>
          <h1 className="text-2xl font-bold text-center mt-4">
            {t("login_to_medbot")}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-600"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown} // 4. onKeyDown is added here
              required
              className="w-full px-3 py-2 mt-1 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-600"
            >
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown} // and here
              required
              className="w-full px-3 py-2 mt-1 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-primary rounded-md hover:bg-primary/90"
          >
            {t("login")}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          {t("dont_have_account")}{" "}
          <Link
            href="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}