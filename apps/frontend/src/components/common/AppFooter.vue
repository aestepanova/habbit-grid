<script setup lang="ts">
/**
 * AppFooter Component
 * Main footer component for the application
 * Features:
 * - Multi-column layout with navigation, resources, social links, and legal info
 * - Logo and tagline
 * - Fully responsive design
 * - Internationalization support
 */
import { useI18n } from "vue-i18n";
import AppLogo from "@/components/common/AppLogo.vue";

const { t } = useI18n();

// Current year for copyright
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <!-- Top Section: Logo, Tagline, and Links -->
      <div class="app-footer__main">
        <!-- Brand Column -->
        <div class="app-footer__brand">
          <AppLogo size="md" />
          <p class="app-footer__tagline">{{ t("footer.tagline") }}</p>
        </div>

        <!-- Navigation Column -->
        <div class="app-footer__column">
          <h4 class="app-footer__column-title">{{ t("footer.navigation.title") }}</h4>
          <ul class="app-footer__links">
            <li>
              <a href="/" class="app-footer__link">{{ t("footer.navigation.habits") }}</a>
            </li>
            <li>
              <a href="/analytics" class="app-footer__link">{{
                t("footer.navigation.analytics")
              }}</a>
            </li>
            <li>
              <a href="/settings" class="app-footer__link">{{
                t("footer.navigation.settings")
              }}</a>
            </li>
          </ul>
        </div>

        <!-- Resources Column -->
        <div class="app-footer__column">
          <h4 class="app-footer__column-title">{{ t("footer.resources.title") }}</h4>
          <ul class="app-footer__links">
            <li>
              <a href="/docs" class="app-footer__link">{{
                t("footer.resources.documentation")
              }}</a>
            </li>
            <li>
              <a href="/blog" class="app-footer__link">{{ t("footer.resources.blog") }}</a>
            </li>
            <li>
              <a href="/support" class="app-footer__link">{{
                t("footer.resources.support")
              }}</a>
            </li>
            <li>
              <a href="/changelog" class="app-footer__link">{{
                t("footer.resources.changelog")
              }}</a>
            </li>
          </ul>
        </div>

        <!-- Social Column -->
        <div class="app-footer__column">
          <h4 class="app-footer__column-title">{{ t("footer.social.title") }}</h4>
          <ul class="app-footer__links">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                class="app-footer__link"
              >
                {{ t("footer.social.github") }}
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                class="app-footer__link"
              >
                {{ t("footer.social.twitter") }}
              </a>
            </li>
            <li>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                class="app-footer__link"
              >
                {{ t("footer.social.discord") }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Legal Column -->
        <div class="app-footer__column">
          <h4 class="app-footer__column-title">{{ t("footer.legal.title") }}</h4>
          <ul class="app-footer__links">
            <li>
              <a href="/privacy" class="app-footer__link">{{
                t("footer.legal.privacy")
              }}</a>
            </li>
            <li>
              <a href="/terms" class="app-footer__link">{{ t("footer.legal.terms") }}</a>
            </li>
            <li>
              <a href="/cookies" class="app-footer__link">{{
                t("footer.legal.cookies")
              }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Section: Copyright and Credits -->
      <div class="app-footer__bottom">
        <div class="app-footer__divider"></div>
        <div class="app-footer__credits">
          <p class="app-footer__copyright">
            {{ t("footer.copyright").replace("2024", currentYear.toString()) }}
          </p>
          <p class="app-footer__made-with">{{ t("footer.madeWith") }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* ========== FOOTER BASE ========== */

.app-footer {
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
  padding: 64px 0 32px;
}

.app-footer__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ========== MAIN SECTION ========== */

.app-footer__main {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 48px;
  margin-bottom: 48px;
}

/* ========== BRAND COLUMN ========== */

.app-footer__brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-footer__tagline {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 280px;
}

/* ========== COLUMNS ========== */

.app-footer__column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-footer__column-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.app-footer__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-footer__link {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
  position: relative;

  &:hover {
    color: var(--color-primary);
    transform: translateX(4px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
    border-radius: 4px;
  }
}

/* ========== BOTTOM SECTION ========== */

.app-footer__bottom {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.app-footer__divider {
  height: 1px;
  background: var(--color-border);
}

.app-footer__credits {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.app-footer__copyright,
.app-footer__made-with {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.app-footer__made-with {
  font-weight: 500;
}

/* ========== RESPONSIVE DESIGN ========== */

@media (max-width: 1024px) {
  .app-footer {
    padding: 48px 0 24px;
  }

  .app-footer__container {
    padding: 0 24px;
  }

  .app-footer__main {
    grid-template-columns: 2fr 1fr 1fr;
    gap: 32px;
  }

  .app-footer__column:nth-child(4),
  .app-footer__column:nth-child(5) {
    grid-column: 2 / 4;
  }
}

@media (max-width: 768px) {
  .app-footer {
    padding: 40px 0 24px;
  }

  .app-footer__container {
    padding: 0 16px;
  }

  .app-footer__main {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-bottom: 32px;
  }

  .app-footer__brand {
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
  }

  .app-footer__tagline {
    max-width: 100%;
  }

  .app-footer__column:nth-child(4),
  .app-footer__column:nth-child(5) {
    grid-column: auto;
  }

  .app-footer__credits {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .app-footer {
    padding: 32px 0 20px;
  }

  .app-footer__container {
    padding: 0 12px;
  }

  .app-footer__main {
    gap: 24px;
    margin-bottom: 24px;
  }

  .app-footer__column-title {
    font-size: 13px;
  }

  .app-footer__link {
    font-size: 13px;
  }

  .app-footer__copyright,
  .app-footer__made-with {
    font-size: 12px;
  }
}

/* ========== ANIMATION ========== */

@media (prefers-reduced-motion: no-preference) {
  .app-footer__link {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>
