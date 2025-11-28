import { createI18n } from "vue-i18n";
import ru from "@/locales/ru.json";
import en from "@/locales/en.json";
import it from "@/locales/it.json";

// Получить язык из localStorage или браузера
const savedLocale = localStorage.getItem("locale");
const browserLocale = navigator.language.split("-")[0];
const defaultLocale = savedLocale || browserLocale || "ru";

const i18n = createI18n({
  legacy: false, // Composition API mode
  locale: defaultLocale,
  fallbackLocale: "en",
  messages: {
    ru,
    en,
    it,
  },
});

export default i18n;
