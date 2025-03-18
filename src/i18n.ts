import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import enTrans from "../locales/en/translation.json"
import viTrans from "../locales/vi/translation.json"

const resources = {
  en: {
    translation: enTrans,
  },
  vi: {
    translation: viTrans,
  },
}

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    supportedLngs: ["en", "vi"],
    debug: true,
    resources,
    fallbackLng: "en",
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
