import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/lib/translations";
import { useCallback } from "react";

export const useTranslation = () => {
    const { isVietnamese } = useAuth();
    const lang = isVietnamese ? 'vi' : 'en';

    const t = useCallback((key: keyof typeof translations.en) => {
        return translations[lang][key] || translations['en'][key];
    }, [lang]);

    return { t, lang };
};