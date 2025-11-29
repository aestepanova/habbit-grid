# StreakDisplay Component

Компонент для отображения статистики активности пользователя в стиле GitHub Contribution Graph.

## Возможности

- ✅ Визуализация активности в виде "тепловой карты"
- ✅ 4 периода отображения: неделя, месяц, полгода, год
- ✅ Автоматический подсчет текущей и лучшей серии
- ✅ Градиентная заливка по интенсивности (5 уровней: 0-4)
- ✅ Настраиваемый базовый цвет для адаптации к темам
- ✅ Интерактивные элементы с тултипами
- ✅ Адаптивный дизайн для мобильных устройств
- ✅ Индикатор серии на квадратиках

## Использование

### Базовый пример

\`\`\`vue
<template>
  <StreakDisplay :logs="habitLogs" />
</template>

<script setup>
import StreakDisplay from '@/components/analytics/StreakDisplay.vue';
import { habitStorageService } from '@/services/habitStorage';

const habitLogs = habitStorageService.getLogs();
</script>
\`\`\`

### С кастомным цветом

\`\`\`vue
<template>
  <StreakDisplay
    :logs="habitLogs"
    base-color="#3b82f6"
    title="Моя активность"
    @day-click="handleDayClick"
  />
</template>

<script setup>
import StreakDisplay from '@/components/analytics/StreakDisplay.vue';

const habitLogs = [
  { habitId: '1', date: '2024-01-15', completed: true },
  { habitId: '2', date: '2024-01-15', completed: true },
  { habitId: '1', date: '2024-01-16', completed: true },
  // ...
];

const handleDayClick = (day) => {
  console.log('Clicked day:', day);
  // day = { date, count, level, streak, dayOfWeek }
};
</script>
\`\`\`

### Для конкретной привычки

\`\`\`vue
<template>
  <StreakDisplay
    :logs="habitLogs"
    :base-color="habit.color"
    :title="`Активность: ${habit.name}`"
  />
</template>

<script setup>
import { computed } from 'vue';
import StreakDisplay from '@/components/analytics/StreakDisplay.vue';
import { habitStorageService } from '@/services/habitStorage';

const habit = { id: '1', name: 'Бег', color: '#10b981' };

const habitLogs = computed(() =>
  habitStorageService.getHabitLogs(habit.id)
);
</script>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logs` | `HabitLog[]` | `[]` | Массив логов выполнения привычек |
| `title` | `string` | `"Активность выполнения привычек"` | Заголовок компонента |
| `baseColor` | `string` | `"#10b981"` | Базовый цвет для градиента (hex) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `day-click` | `ActivityDay` | Вызывается при клике на квадратик дня |

### ActivityDay Interface

\`\`\`typescript
interface ActivityDay {
  date: string;        // ISO дата (YYYY-MM-DD)
  count: number;       // Количество выполнений
  level: number;       // Уровень интенсивности (0-4)
  streak: number;      // Текущая серия на этот день
  dayOfWeek: number;   // День недели (0-6)
}
\`\`\`

## Алгоритм расчета уровня интенсивности

Уровень интенсивности (0-4) рассчитывается на основе нормализации к максимальному количеству выполнений за период:

- **0** - нет активности
- **1** - 1-24% от максимума
- **2** - 25-49% от максимума
- **3** - 50-74% от максимума
- **4** - 75-100% от максимума

Цвет квадратика вычисляется как:
\`\`\`
opacity = 0.2 + level * 0.2
// level 0: var(--color-bg-secondary)
// level 1: rgba(baseColor, 0.4)
// level 2: rgba(baseColor, 0.6)
// level 3: rgba(baseColor, 0.8)
// level 4: rgba(baseColor, 1.0)
\`\`\`

## Рекомендуемые цвета для тем

### Светлая тема
- Зеленый: `#10b981` (по умолчанию)
- Синий: `#3b82f6`
- Фиолетовый: `#8b5cf6`
- Оранжевый: `#f59e0b`

### Темная тема
- Зеленый: `#34d399`
- Синий: `#60a5fa`
- Фиолетовый: `#a78bfa`
- Оранжевый: `#fbbf24`

## Адаптивность

- **Desktop**: Квадратики 14x14px с отступом 4px
- **Mobile (< 768px)**: Квадратики 12x12px с отступом 3px
- Автоматическое изменение layout на мобильных

## Стилизация

Компонент использует CSS-переменные из вашей темы:
- `--color-bg-card`
- `--color-border`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-bg-secondary`
- `--color-primary`
