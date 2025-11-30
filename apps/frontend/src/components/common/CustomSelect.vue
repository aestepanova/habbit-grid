<template>
  <div class="custom-select" ref="selectRef">
    <!-- Select trigger button -->
    <button
      type="button"
      class="custom-select__trigger"
      :class="{ 'custom-select__trigger--open': isOpen }"
      @click="toggleDropdown"
    >
      <span class="custom-select__value">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="custom-select__arrow" :class="{ 'custom-select__arrow--open': isOpen }">
        ▼
      </span>
    </button>

    <!-- Dropdown -->
    <transition name="dropdown">
      <div v-if="isOpen" class="custom-select__dropdown">
        <!-- Search input -->
        <div class="custom-select__search">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="custom-select__search-input"
            :placeholder="searchPlaceholder"
            @click.stop
          />
        </div>

        <!-- Options list (scrollable, max 3 visible) -->
        <div class="custom-select__options">
          <div
            v-for="option in filteredOptions"
            :key="option.value"
            class="custom-select__option"
            :class="{ 'custom-select__option--selected': option.value === modelValue }"
            @click="selectOption(option)"
          >
            <span v-if="option.icon" class="custom-select__option-icon">
              <img :src="option.icon" :alt="option.label" />
            </span>
            <span class="custom-select__option-label">{{ option.label }}</span>
          </div>

          <!-- No results message -->
          <div v-if="filteredOptions.length === 0" class="custom-select__no-results">
            {{ noResultsText }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface Props {
  modelValue: string;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Выберите опцию",
  searchPlaceholder: "Поиск...",
  noResultsText: "Ничего не найдено",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const selectRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

/**
 * Computed: Selected option label
 */
const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue);
  return selected ? selected.label : "";
});

/**
 * Computed: Filtered options based on search query
 */
const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.options;
  }

  const query = searchQuery.value.toLowerCase();
  return props.options.filter((option) =>
    option.label.toLowerCase().includes(query)
  );
});

/**
 * Toggle dropdown open/close
 */
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    // Focus search input when opening
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
};

/**
 * Select an option
 */
const selectOption = (option: SelectOption) => {
  emit("update:modelValue", option.value);
  isOpen.value = false;
  searchQuery.value = "";
};

/**
 * Close dropdown when clicking outside
 */
const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false;
    searchQuery.value = "";
  }
};

/**
 * Close dropdown on Escape key
 */
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isOpen.value) {
    isOpen.value = false;
    searchQuery.value = "";
  }
};

// Reset search when dropdown closes
watch(isOpen, (newValue) => {
  if (!newValue) {
    searchQuery.value = "";
  }
});

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}

/* Trigger button */
.custom-select__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: var(--color-shadow-glow);
  }
}

.custom-select__trigger--open {
  border-color: var(--color-primary);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.custom-select__value {
  flex: 1;
  text-align: left;
  color: var(--color-text-primary);
}

.custom-select__value:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-muted);
}

.custom-select__arrow {
  margin-left: 8px;
  font-size: 10px;
  transition: transform 0.2s ease;
  color: var(--color-text-secondary);
}

.custom-select__arrow--open {
  transform: rotate(180deg);
}

/* Dropdown */
.custom-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-card);
  border: 1px solid var(--color-primary);
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
}

/* Search input */
.custom-select__search {
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.custom-select__search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 13px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
}

/* Options list - scrollable, max 3 items visible */
.custom-select__options {
  max-height: 156px; /* 52px per item × 3 items */
  overflow-y: auto;
}

.custom-select__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-bg-secondary);
  }
}

.custom-select__option--selected {
  background: var(--color-primary);
  color: var(--color-text-white);

  &:hover {
    background: var(--color-primary-dark, #2563eb);
  }
}

.custom-select__option-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.custom-select__option-label {
  flex: 1;
  font-size: 14px;
}

/* No results */
.custom-select__no-results {
  padding: 16px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
}

/* Scrollbar styling */
.custom-select__options::-webkit-scrollbar {
  width: 6px;
}

.custom-select__options::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

.custom-select__options::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;

  &:hover {
    background: var(--color-text-secondary);
  }
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 768px) {
  .custom-select__options {
    max-height: 144px; /* 48px per item × 3 items */
  }

  .custom-select__option {
    padding: 10px 14px;
  }
}
</style>
