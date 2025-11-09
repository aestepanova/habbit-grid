<template>
  <div
    :class="[
      'base-card',
      `base-card--${variant}`,
      {
        'base-card--hoverable': hoverable,
        'base-card--flat': flat,
        'base-card--padded-lg': paddingSize === 'large',
        'base-card--padded-md': paddingSize === 'medium',
        'base-card--padded-sm': paddingSize === 'small'
      }
    ]"
  >
    <!-- Заголовок (опционально) -->
    <div v-if="title" class="base-card__header">
      <h3 class="base-card__title">{{ title }}</h3>
      <slot name="header-action" />
    </div>

    <!-- Основное содержимое -->
    <div class="base-card__content">
      <slot />
    </div>

    <!-- Подвал (опционально) -->
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  title?: string
  variant?: 'default' | 'accent' | 'subtle'
  hoverable?: boolean
  flat?: boolean
  paddingSize?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: false,
  flat: false,
  paddingSize: 'medium'
})
</script>

<style scoped>
.base-card {
  background: var(--color-card);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.2s ease;
}

/* Размеры паддинга */
.base-card--padded-lg {
  padding: 32px;
}
.base-card--padded-md {
  padding: 24px;
}
.base-card--padded-sm {
  padding: 16px;
}

/* Варианты карточек */
.base-card--default {
  box-shadow: var(--color-shadow);
}

.base-card--accent {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-text-white);
  border: none;
  box-shadow: var(--color-shadow-card);

  .base-card__title {
    color: var(--color-text-white);
  }
}

.base-card--subtle {
  background: var(--color-card-secondary);
  box-shadow: none;
  border: none;
}

/* Интерактивная карточка */
.base-card--hoverable {
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--color-shadow-card);
  }
}

/* Без тени */
.base-card--flat {
  box-shadow: none;
}

/* Заголовок */
.base-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.base-card__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
}

.base-card--accent .base-card__header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* Содержимое */
.base-card__content {
  color: var(--color-text-main);
}

/* Подвал */
.base-card__footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.base-card--accent .base-card__footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* Адаптивность */
@media (max-width: 768px) {
  .base-card--padded-lg {
    padding: 20px;
  }
  .base-card--padded-md {
    padding: 16px;
  }
  .base-card--padded-sm {
    padding: 12px;
  }

  .base-card__title {
    font-size: 16px;
  }

  .base-card__header {
    margin-bottom: 12px;
    padding-bottom: 12px;
  }
}
</style>
