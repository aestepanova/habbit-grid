<template>
  <!-- Overlay/Backdrop -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="handleBackdropClick">
        <!-- Основное модальное окно -->
        <transition name="modal-slide">
          <div v-if="isOpen" class="base-modal" @click.stop>
            <!-- Заголовок -->
            <div class="base-modal__header">
              <h2 class="base-modal__title">{{ title }}</h2>
              <button
                class="base-modal__close"
                aria-label="Закрыть"
                @click="handleClose"
              >
                ✕
              </button>
            </div>

            <!-- Содержимое -->
            <div class="base-modal__content">
              <slot />
            </div>

            <!-- Подвал с кнопками (опционально) -->
            <div v-if="$slots.footer" class="base-modal__footer">
              <slot name="footer" />
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'

interface Props {
  title?: string
  isOpen?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  closeOnBackdrop: true,
  closeOnEscape: true,
  size: 'medium'
})

const emit = defineEmits<{
  close: []
  'update:isOpen': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value)
})

const handleClose = () => {
  emit('close')
  isOpen.value = false
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape && isOpen.value) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = 'auto'
})

watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})
</script>

<script lang="ts">
import { watch } from 'vue'
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

/* Модальное окно */
.base-modal {
  background: var(--color-card);
  border-radius: 16px;
  box-shadow: var(--color-shadow-card);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: modalOpen 0.3s ease;
}

/* Размеры */
.base-modal {
  width: 500px;
}

.modal-overlay.size-small .base-modal {
  width: 350px;
}

.modal-overlay.size-large .base-modal {
  width: 700px;
}

/* Заголовок */
.base-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.base-modal__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-main);
}

/* Кнопка закрытия */
.base-modal__close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: var(--color-text-main);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-card-secondary);
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* Содержимое */
.base-modal__content {
  padding: 24px;
  color: var(--color-text-main);
  flex: 1;
  overflow-y: auto;
}

/* Подвал */
.base-modal__footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* Анимации */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  animation: modalOpen 0.3s ease;
}

.modal-slide-leave-active {
  animation: modalClose 0.3s ease;
}

@keyframes modalOpen {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalClose {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .base-modal {
    width: 90vw;
    max-height: 90vh;
  }

  .base-modal__header,
  .base-modal__content,
  .base-modal__footer {
    padding: 16px;
  }

  .base-modal__title {
    font-size: 18px;
  }
}
</style>
