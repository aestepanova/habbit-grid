<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, ref } from "vue";

const { locale } = useI18n();
const isDropdownOpen = ref(false);

const languages = [
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

const currentLanguage = computed(() => {
  return languages.find((lang) => lang.code === locale.value);
});

const changeLanguage = (lang: string) => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
  isDropdownOpen.value = false;
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
</script>

<template>
  <div class="language-switcher">
    <!-- Trigger Button -->
    <button
      class="lang-btn lang-btn--trigger"
      @click="toggleDropdown"
      :title="`${currentLanguage?.name || 'Language'}`"
    >
      <span class="lang-flag">{{ currentLanguage?.flag || "🌐" }}</span>
      <span class="lang-name">{{
        currentLanguage?.code.toUpperCase() || "EN"
      }}</span>
      <span
        class="lang-chevron"
        :class="{ 'lang-chevron--open': isDropdownOpen }"
      >
        ▼
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div v-if="isDropdownOpen" class="lang-dropdown">
      <button
        v-for="lang in languages"
        :key="lang.code"
        :class="[
          'lang-option',
          { 'lang-option--active': locale === lang.code },
        ]"
        @click="changeLanguage(lang.code)"
      >
        <span class="lang-option__flag">{{ lang.flag }}</span>
        <span class="lang-option__name">{{ lang.name }}</span>
        <span v-if="locale === lang.code" class="lang-option__check">✓</span>
      </button>
    </div>

    <!-- Overlay to close dropdown -->
    <div
      v-if="isDropdownOpen"
      class="lang-overlay"
      @click="isDropdownOpen = false"
    ></div>
  </div>
</template>

<style scoped>
.language-switcher {
  position: relative;
}

/* ========== TRIGGER BUTTON ========== */

.lang-btn--trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text-primary);
}

.lang-btn--trigger:hover {
  background: var(--color-border-light);
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.lang-flag {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.lang-name {
  font-weight: var(--fw-semibold);
  min-width: 30px;
}

.lang-chevron {
  font-size: 10px;
  transition: transform var(--duration-normal) var(--ease-standard);
  display: flex;
  align-items: center;
  margin-left: 4px;
  opacity: 0.6;
}

.lang-chevron--open {
  transform: rotate(180deg);
}

/* ========== DROPDOWN ========== */

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--color-shadow-card);
  overflow: hidden;
  z-index: 1001;
  min-width: 180px;
  animation: slideDownDropdown var(--duration-normal) var(--ease-standard);
}

@keyframes slideDownDropdown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== OPTIONS ========== */

.lang-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
  font-family: inherit;
  font-size: var(--fs-base);
  color: var(--color-text-primary);
}

.lang-option:hover {
  background: var(--color-bg-secondary);
}

.lang-option--active {
  background: var(--color-accent-light);
  color: var(--color-text-white);
}

.lang-option__flag {
  font-size: 18px;
  flex-shrink: 0;
}

.lang-option__name {
  flex: 1;
  font-weight: var(--fw-medium);
}

.lang-option__check {
  font-size: 14px;
  font-weight: var(--fw-bold);
  flex-shrink: 0;
}

/* ========== OVERLAY ========== */

.lang-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

/* ========== RESPONSIVE ========== */

@media (max-width: 768px) {
  .lang-btn--trigger {
    padding: 6px 10px;
    font-size: var(--fs-xs);
  }

  .lang-name {
    min-width: auto;
  }

  .lang-chevron {
    display: none;
  }

  .lang-dropdown {
    right: -8px;
    min-width: 160px;
  }

  .lang-option {
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .lang-btn--trigger {
    padding: 6px 8px;
    border-radius: var(--radius-sm);
  }

  .lang-flag {
    font-size: 14px;
  }

  .lang-dropdown {
    min-width: 140px;
  }

  .lang-option {
    padding: 8px 10px;
    gap: 8px;
  }

  .lang-option__flag {
    font-size: 16px;
  }
}
</style>
