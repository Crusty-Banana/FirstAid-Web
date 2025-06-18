"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { CloseIcon } from "./CloseIcon";
import { LoadingIcon } from "./LoadingIcon";
import { useTranslation } from "@/hooks/useTranslation";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, logout, fetchProfile, setIsVietnamese: setGlobalIsVietnamese } = useAuth();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [isVietnamese, setIsVietnamese] = useState(false);
  const [useRAG, setUseRAG] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchPreferences = async () => {
        setIsLoading(true);
        try {
          const response = await api.get("/profile/preferences");
          const prefs = response.data.preferences;
          if (prefs) {
            setIsVietnamese(prefs.isVietnamese || false);
            setUseRAG(prefs.useRAG || false);
          }
        } catch (error) {
          console.error("Failed to fetch preferences", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPreferences();
      setFirstName(user?.first_name || "");
      setLastName(user?.last_name || "");
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("/profile/", {
        first_name: firstName,
        last_name: lastName,
        preferences: {
            isVietnamese,
            useRAG,
        }
      });
      await fetchProfile();
      setGlobalIsVietnamese(isVietnamese);
      onClose();
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 w-full max-w-md text-black" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t("settings")}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <CloseIcon />
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingIcon />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex space-x-4">
              <input
                placeholder={t("first_name")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 text-black bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder={t("last_name")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 text-black bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t("language")}</span>
              <div className="flex items-center space-x-2">
                <span>EN</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVietnamese}
                    onChange={() => setIsVietnamese(!isVietnamese)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span>VI</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t("use_rag")}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRAG}
                  onChange={() => setUseRAG(!useRAG)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2 font-semibold text-white bg-primary rounded-md hover:bg-primary/90 disabled:bg-gray-400"
            >
              {isSaving ? t("saving") : t("save")}
            </button>
            <button
              onClick={logout}
              className="w-full text-center p-2 rounded-md bg-danger hover:bg-danger/90 text-white"
            >
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}