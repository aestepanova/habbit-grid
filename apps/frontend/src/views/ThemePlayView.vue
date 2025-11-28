<script setup lang="ts">
// Получаем элементы
const html = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
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
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

// Запускаем при загрузке
init();
</script>

<template>
  <!DOCTYPE html>
  <html lang="ru">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Dark Mode Toggle</title>
    </head>
    <body>
      <header>
        <h1>🌓 Мой сайт</h1>
        <button
          class="theme-toggle"
          id="themeToggle"
          aria-label="Переключить тему"
        >
          <span class="theme-toggle-icon" id="themeIcon">🌙</span>
          <span id="themeText">Темная тема</span>
        </button>
      </header>

      <main>
        <section class="section">
          <h2>О функции Dark Mode</h2>
          <p>
            Chrome DevTools позволяет эмулировать темную тему, но теперь ты
            можешь реализовать это на своем сайте с переключателем!
          </p>
        </section>

        <article class="card">
          <h2>Преимущества темной темы</h2>
          <p>✨ Снижает нагрузку на глаза при работе в темноте</p>
          <p>🔋 Экономит батарею на OLED экранах</p>
          <p>🎨 Улучшает пользовательский опыт</p>
        </article>

        <article class="card">
          <h2>Как это реализовано</h2>
          <p>
            CSS переменные хранят значения цветов, которые меняются в
            зависимости от выбранной темы. localStorage сохраняет предпочтение
            пользователя.
          </p>
        </article>

        <article class="card">
          <h2>Переключение в реальном времени</h2>
          <p>
            Нажми кнопку переключения в правом верхнем углу и смотри, как
            меняется весь интерфейс!
          </p>
        </article>
      </main>
    </body>
  </html>
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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

h1 {
  font-size: 28px;
}

/* Кнопка переключения */
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

/* Основной контент */
main {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--accent-color);
}

.card h2 {
  color: var(--accent-color);
  margin-bottom: 10px;
}

.card p {
  color: var(--text-secondary);
}

.section {
  margin: 30px 0;
}
</style>
