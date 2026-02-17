import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/common.json";
import bn from "./locales/bn/common.json";

const saved = localStorage.getItem("lang");
const prefersBn = (navigator.language || "").toLowerCase().startsWith("bn");
const fallbackLng = saved || (prefersBn ? "bn" : "en");

const resources = {
  en: { common: en },
  bn: { common: bn },
};

i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLng,
  fallbackLng: "en",
  ns: ["common"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language || "en";

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng || "en";
});

export default i18n;
