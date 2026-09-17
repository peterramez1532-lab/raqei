"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Language = "en" | "ar";

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("raqei-language");

    const currentLanguage: Language =
      savedLanguage === "ar" ? "ar" : "en";

    setLanguage(currentLanguage);

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir =
      currentLanguage === "ar" ? "rtl" : "ltr";
  }, []);

  const toggleLanguage = () => {
    const newLanguage: Language =
      language === "en" ? "ar" : "en";

    setLanguage(newLanguage);

    localStorage.setItem("raqei-language", newLanguage);

    document.documentElement.lang = newLanguage;
    document.documentElement.dir =
      newLanguage === "ar" ? "rtl" : "ltr";
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
