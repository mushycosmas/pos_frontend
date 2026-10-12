
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import sw from "./locales/sw.json";

const savedLanguage =
  localStorage.getItem("pos_language") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en
    },
    sw: {
      translation: sw
    }
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
