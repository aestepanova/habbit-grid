<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "@/components/common/LanguageSwitcher.vue";
import AppLogo from "@/components/common/AppLogo.vue";

const { t } = useI18n();
const isMobileMenuOpen = ref(false);

// Проверяем, на главной странице или нет (для логики активности)
const currentPath = computed(() => {
  return window.location.pathname;
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const navigateTo = (path: string) => {
  window.location.href = path;
  closeMobileMenu();
};
</script>

<template>
  <header class="app-header">
    <!-- Container for max-width and padding -->
    <div class="app-header__container">
      <!-- Logo / Brand -->
      <div class="app-header__brand">
        <a href="/" class="app-header__logo-link">
          <AppLogo size="md" />
        </a>
      </div>

      <!-- Desktop Navigation -->
      <nav class="app-header__nav app-header__nav--desktop">
        <a href="/" class="app-header__nav-link">{{ t("nav.habits") }}</a>
        <a href="/dashboard" class="app-header__nav-link">{{
          t("nav.dashboard")
        }}</a>
        <a href="/settings" class="app-header__nav-link">{{
          t("nav.settings")
        }}</a>
      </nav>

      <!-- Right Section: Language Switcher + Mobile Menu Button -->
      <div class="app-header__right">
        <!-- Language Switcher -->
        <LanguageSwitcher />

        <!-- Mobile Menu Button -->
        <button
          class="app-header__mobile-toggle"
          :class="{ 'app-header__mobile-toggle--active': isMobileMenuOpen }"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
        >
          <span class="hamburger">
            <span class="hamburger__line"></span>
            <span class="hamburger__line"></span>
            <span class="hamburger__line"></span>
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <nav
      v-if="isMobileMenuOpen"
      class="app-header__nav app-header__nav--mobile"
      @click="closeMobileMenu"
    >
      <a href="/" class="app-header__nav-link app-header__nav-link--mobile">
        {{ t("nav.habits") }}
      </a>
      <a
        href="/dashboard"
        class="app-header__nav-link app-header__nav-link--mobile"
      >
        {{ t("nav.dashboard") }}
      </a>
      <a
        href="/settings"
        class="app-header__nav-link app-header__nav-link--mobile"
      >
        {{ t("nav.settings") }}
      </a>
    </nav>
  </header>
</template>

<style scoped>
/* ========== HEADER BASE ========== */

.app-header {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--color-shadow);
}

.app-header__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* ========== BRAND / LOGO ========== */

.app-header__brand {
  flex-shrink: 0;
}

.app-header__logo-link {
  text-decoration: none;
  transition: var(--transition);
  display: flex;
  align-items: center;
}

.app-header__logo-link:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

/* ========== DESKTOP NAVIGATION ========== */

.app-header__nav--desktop {
  display: flex;
  align-items: center;
  gap: 32px;
  margin: 0;
  flex: 1;
  justify-content: center;
}

.app-header__nav-link {
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: var(--transition);
  position: relative;
  padding: 8px 0;
}

.app-header__nav-link:hover {
  color: var(--color-primary);
}

.app-header__nav-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gradient-primary);
  transition: width var(--duration-normal) var(--ease-standard);
}

.app-header__nav-link:hover::after {
  width: 100%;
}

/* ========== RIGHT SECTION ========== */

.app-header__right {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

/* ========== MOBILE TOGGLE BUTTON ========== */

.app-header__mobile-toggle {
  display: none;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  flex-direction: column;
  gap: 6px;
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hamburger__line {
  width: 24px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px;
  transition: var(--transition);
}

.app-header__mobile-toggle--active .hamburger__line:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.app-header__mobile-toggle--active .hamburger__line:nth-child(2) {
  opacity: 0;
}

.app-header__mobile-toggle--active .hamburger__line:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* ========== MOBILE NAVIGATION ========== */

.app-header__nav--mobile {
  display: none;
  flex-direction: column;
  gap: 0;
  padding: 16px 32px;
  border-top: 1px solid var(--color-border);
  animation: slideDown var(--duration-normal) var(--ease-standard);
}

.app-header__nav-link--mobile {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  display: block;
}

.app-header__nav-link--mobile:last-child {
  border-bottom: none;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== RESPONSIVE ========== */

@media (max-width: 1024px) {
  .app-header__container {
    padding: 0 24px;
  }

  .app-header__nav--desktop {
    gap: 24px;
  }

  .app-header__nav-link {
    font-size: var(--fs-sm);
  }
}

@media (max-width: 768px) {
  .app-header__container {
    padding: 0 16px;
    height: 56px;
  }

  .app-header__nav--desktop {
    display: none;
  }

  .app-header__mobile-toggle {
    display: flex;
  }

  .app-header__nav--mobile {
    display: flex;
  }

  .app-header__logo-text {
    font-size: var(--fs-base);
  }

  .app-header__right {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .app-header__container {
    padding: 0 12px;
  }

  .app-header__logo-text {
    display: none;
  }

  .app-header__logo-icon {
    font-size: 24px;
  }

  .app-header__nav--mobile {
    padding: 12px 12px;
  }

  .app-header__right {
    gap: 12px;
  }
}
</style>
