<script setup lang="ts">
// Получаем элементы
const html = document.documentElement;
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

// Константы для тем
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

const STORAGE_KEY = "theme-preference";

/**
 * Определяет текущую тему на основе приоритета:
 * 1. localStorage (если пользователь установил явно)
 * 2. Системное предпочтение (prefers-color-scheme)
 * 3. Светлая тема (по умолчанию)
 */
function getPreferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved && saved !== THEMES.SYSTEM) {
    return saved;
  }

  // Проверяем системное предпочтение
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return THEMES.DARK;
  }

  return THEMES.LIGHT;
}

/**
 * Применяет тему к странице
 */
function applyTheme(theme: string) {
  if (themeIcon && themeText) {
    if (theme === THEMES.LIGHT) {
      html.setAttribute("data-theme", THEMES.LIGHT);
      themeIcon.textContent = "🌙";
      themeText.textContent = "Темная тема";
    } else if (theme === THEMES.DARK) {
      html.setAttribute("data-theme", THEMES.DARK);
      themeIcon.textContent = "☀️";
      themeText.textContent = "Светлая тема";
    } else {
      // SYSTEM - удаляем атрибут, используем системное предпочтение
      html.removeAttribute("data-theme");
      updateIconForSystemTheme();
    }
  }
}

/**
 * Обновляет иконку в зависимости от системной темы
 */
function updateIconForSystemTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (themeIcon && themeText) {
    themeIcon.textContent = isDark ? "☀️" : "🌙";
    themeText.textContent = isDark ? "Светлая тема" : "Темная тема";
  }
}

/**
 * Переключает тему между светлой и темной
 */
function toggleTheme() {
  const currentTheme = localStorage.getItem(STORAGE_KEY) || THEMES.LIGHT;
  const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;

  localStorage.setItem(STORAGE_KEY, newTheme);
  applyTheme(newTheme);
}

/**
 * Реагирует на изменение системного предпочтения
 */
function setupSystemThemeListener() {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Если пользователь не установил явную тему, обновляем при изменении системы
      if (!saved || saved === THEMES.SYSTEM) {
        const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
        applyTheme(newTheme);
      }
    });
}

// Инициализация
function init() {
  const preferredTheme = getPreferredTheme();
  applyTheme(preferredTheme);
  setupSystemThemeListener();
}

// Запускаем при загрузке
init();
</script>

<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    aria-label="Переключить тему"
  >
    <span class="theme-toggle-icon" id="themeIcon">🌙</span>
    <span id="themeText">Темная тема</span>
  </button>
</template>

<style scoped>
:root {
  /* Светлая тема (по умолчанию) */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --accent-color: #0066cc;

  color-scheme: light;
}

/* Темная тема - системное предпочтение */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --border-color: #404040;
    --accent-color: #4da6ff;

    color-scheme: dark;
  }
}

/* Явная темная тема (data-theme="dark") */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --border-color: #404040;
  --accent-color: #4da6ff;

  color-scheme: dark;
}

/* Явная светлая тема */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --accent-color: #0066cc;

  color-scheme: light;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  color: var(--text-primary);
}

.theme-toggle:hover {
  background: var(--accent-color);
  color: var(--bg-primary);
  border-color: var(--accent-color);
}

.theme-toggle-icon {
  font-size: 20px;
}
</style>